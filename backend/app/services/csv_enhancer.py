import pandas as pd
from openai import OpenAI
import json
import time
from typing import Dict, List, Any

from backend.app.core.config import OPENAI_API_KEY, OPENAI_MODEL

class CSVEnhancer:
    """Service for enhancing CSV files using OpenAI"""
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize the CSV enhancer with a configuration"""
        self.config = config
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        
    def process_file(self, input_path: str, output_path: str) -> None:
        """Process the CSV file according to the configuration"""
        # Load the dataset
        df = pd.read_csv(input_path)
        
        # Process each column
        for column in self.config["column_context"]:
            if column in df.columns:
                print(f"Processing column: {column}")
                batch_size = self.config["batch_sizes"].get(column, 10)
                
                for i in range(0, len(df), batch_size):
                    batch = df.iloc[i:i + batch_size]
                    self._process_batch(df, column, batch)
                    print(f"Processed {i + len(batch)}/{len(df)} in column {column}")
        
        # Save the processed file
        df.to_csv(output_path, index=False)
        print(f"Processing complete. Saved as '{output_path}'")
        
    def _process_batch(self, df: pd.DataFrame, column_name: str, batch: pd.DataFrame) -> None:
        """Process a batch of rows for a specific column"""
        context_fields = self.config["column_context"].get(column_name, [])
        ignore_valued = self.config["ignore_valued_columns"].get(column_name, False)
        
        prompt_parts = []
        index_mapping = list(batch.index)
        
        for idx, df_idx in enumerate(index_mapping):
            if ignore_valued and pd.notnull(df.at[df_idx, column_name]) and df.at[df_idx, column_name] != '':
                continue
                
            context_values = " | ".join(f"{field}: {df.at[df_idx, field]}" 
                                       for field in context_fields 
                                       if field in df.columns and pd.notnull(df.at[df_idx, field]))
                                       
            existing_value = df.at[df_idx, column_name] if pd.notnull(df.at[df_idx, column_name]) else "Missing"
            prompt_parts.append(f"Entry {idx + 1}:\nContext: {context_values}\nCurrent {column_name}: {existing_value}\n")
        
        if not prompt_parts:
            return  # Skip if no relevant rows to process
            
        # Build prompt
        prompt = f"""
        You are cleaning and enhancing a dataset. Each entry has various attributes that may need validation or filling in.
        Your task is to assess and correct the {column_name} values using the given context.
        
        Here are multiple entries:
        {''.join(prompt_parts)}
        
        Respond in the following format (not JSON):
        [
          {{"Index": 1, "{column_name}": "<Corrected Value>"}},
          {{"Index": 2, ...}}
        ]
        """
        
        try:
            response = self.client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            # Extract text response
            result_text = response.choices[0].message.content.strip()
            
            # Try parsing it as JSON
            results = json.loads(result_text)
            
            # Update the batch
            for result in results:
                index = result.get("Index") - 1
                if 0 <= index < len(index_mapping):
                    df.at[index_mapping[index], column_name] = result.get(column_name, df.at[index_mapping[index], column_name])
                    
        except json.JSONDecodeError:
            print(f"JSON parsing error for {column_name} batch. GPT response: {result_text}")
        except Exception as e:
            print(f"Error processing {column_name} batch. Error: {e}")


def generate_config_from_description(description: str, columns: List[str]) -> Dict[str, Any]:
    """Generate configuration based on natural language description"""
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    prompt = f"""
    I have a CSV file with the following columns: {', '.join(columns)}
    
    The user wants to: {description}
    
    Generate a configuration for processing this CSV file. The configuration should include:
    1. Which columns to process
    2. What context columns to use for each column being processed
    3. Appropriate batch sizes for each column
    4. Whether to ignore existing values
    
    Return the configuration as a JSON object with this structure:
    {{
        "column_context": {{"column_name": ["context_column1", "context_column2"]}},
        "batch_sizes": {{"column_name": batch_size}},
        "ignore_valued_columns": {{"column_name": true_or_false}}
    }}
    """
    
    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1000,
        temperature=0.3
    )
    
    config_text = response.choices[0].message.content
    
    # Extract JSON from the response
    try:
        # Find JSON block in the response
        start_idx = config_text.find('{')
        end_idx = config_text.rfind('}') + 1
        if start_idx >= 0 and end_idx > start_idx:
            config_json = config_text[start_idx:end_idx]
            config = json.loads(config_json)
            return config
        else:
            # Default configuration if JSON extraction fails
            return create_default_config(columns)
    except json.JSONDecodeError:
        # Default configuration if JSON parsing fails
        return create_default_config(columns)


def create_default_config(columns: List[str]) -> Dict[str, Any]:
    """Create a default configuration based on columns"""
    config = {
        "column_context": {},
        "batch_sizes": {},
        "ignore_valued_columns": {}
    }
    
    for column in columns:
        config["column_context"][column] = columns[:3] if len(columns) >= 3 else columns
        config["batch_sizes"][column] = 10
        config["ignore_valued_columns"][column] = False
    
    return config 