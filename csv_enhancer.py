import pandas as pd
from openai import OpenAI
import os
import json
import time
from dotenv import load_dotenv

load_dotenv()

def generate_config_from_description(description, columns):
    """Generate configuration based on natural language description"""
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    prompt = f"""
    I have a CSV file with the following columns: {', '.join(columns)}
    
    The user wants to: {description}
    
    Generate a configuration for processing this CSV file. The configuration should include ONLY what the user explicitly asks for:
    1. Which columns to process (including new columns that don't exist yet) - ONLY if the user asks for column operations
    2. What context columns to use for each column being processed
    3. Appropriate batch sizes for each column
    4. Whether to ignore existing values
    5. Any specific transformation instructions for each column
    
    If the user wants to create a new column that doesn't exist in the original CSV, include it in the configuration.
    If the user wants to generate new rows, set the "generate_rows" field to the number of rows to generate.
    
    IMPORTANT: If the user ONLY asks to generate new rows and doesn't mention any column operations, 
    the "column_context", "batch_sizes", "ignore_valued_columns", and "transformation_instructions" 
    should be empty objects. DO NOT add any columns to process unless explicitly requested.
    
    IMPORTANT: If the user says something like "only generate rows" or "just add new rows" or "generate rows without modifying columns",
    this means they ONLY want to generate rows and DO NOT want to process any columns.
    
    Return the configuration as a JSON object with this structure:
    {{
        "column_context": {{"column_name": ["context_column1", "context_column2"]}},
        "batch_sizes": {{"column_name": batch_size}},
        "ignore_valued_columns": {{"column_name": true_or_false}},
        "transformation_instructions": {{"column_name": "specific instruction for this column"}},
        "generate_rows": number_of_rows_to_generate,
        "dataset_description": "optional description of what this dataset represents"
    }}
    
    Examples:
    1. If the user wants to categorize items as edible or inedible, the configuration might be:
    {{
      "column_context": {{"Category": ["Title", "Description"]}},
      "batch_sizes": {{"Category": 10}},
      "ignore_valued_columns": {{"Category": false}},
      "transformation_instructions": {{"Category": "Categorize each item as either 'Edible' or 'Inedible' based on the product type and description"}},
      "generate_rows": 0
    }}
    
    2. If the user wants to add a new column for popularity ratings, the configuration might include:
    {{
      "column_context": {{"Popularity": ["Title", "Description", "Price"]}},
      "batch_sizes": {{"Popularity": 10}},
      "ignore_valued_columns": {{"Popularity": false}},
      "transformation_instructions": {{"Popularity": "Assign a popularity rating of 'Low', 'Moderate', or 'High' based on the product attributes"}},
      "generate_rows": 0
    }}
    
    3. If the user ONLY wants to generate 5 new rows, the configuration should be:
    {{
      "column_context": {{}},
      "batch_sizes": {{}},
      "ignore_valued_columns": {{}},
      "transformation_instructions": {{}},
      "generate_rows": 5,
      "dataset_description": "This is a product catalog with items, categories, and prices"
    }}
    
    4. If the user says "generate 10 new rows and add a popularity column", the configuration should include both:
    {{
      "column_context": {{"Popularity": ["Title", "Description", "Price"]}},
      "batch_sizes": {{"Popularity": 10}},
      "ignore_valued_columns": {{"Popularity": false}},
      "transformation_instructions": {{"Popularity": "Assign a popularity rating of 'Low', 'Moderate', or 'High' based on the product attributes"}},
      "generate_rows": 10,
      "dataset_description": "This is a product catalog with items, categories, and prices"
    }}
    """
    
    response = client.chat.completions.create(
        model=os.getenv('OPENAI_MODEL', 'gpt-4o-mini'),
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
            
            # Ensure all required keys exist
            if "column_context" not in config:
                config["column_context"] = {}
            if "batch_sizes" not in config:
                config["batch_sizes"] = {}
            if "ignore_valued_columns" not in config:
                config["ignore_valued_columns"] = {}
            if "transformation_instructions" not in config:
                config["transformation_instructions"] = {}
            if "generate_rows" not in config:
                config["generate_rows"] = 0
                
            # Check if this is a rows-only configuration
            if config.get("generate_rows", 0) > 0 and not config.get("column_context", {}):
                # Make sure all column-related configurations are empty
                config["column_context"] = {}
                config["batch_sizes"] = {}
                config["ignore_valued_columns"] = {}
                config["transformation_instructions"] = {}
                
            return config
        else:
            # Default configuration if JSON extraction fails
            return create_default_config(columns)
    except json.JSONDecodeError:
        # Default configuration if JSON parsing fails
        return create_default_config(columns)

def create_default_config(columns):
    """Create a default configuration based on columns"""
    config = {
        "column_context": {},
        "batch_sizes": {},
        "ignore_valued_columns": {},
        "transformation_instructions": {},
        "generate_rows": 0,
        "dataset_description": ""
    }
    
    # We no longer automatically add column configurations
    # This ensures that row-only generation works properly
    
    return config

class CSVEnhancer:
    def __init__(self, config):
        self.config = config
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
    def process_file(self, input_path, output_path):
        """Process the CSV file according to the configuration"""
        # Load the dataset
        df = pd.read_csv(input_path)
        original_row_count = len(df)
        
        # Determine what operations to perform
        generate_rows_only = self.config.get("generate_rows", 0) > 0 and not self.config.get("column_context", {})
        process_columns = bool(self.config.get("column_context", {}))
        
        print(f"Operations to perform:")
        print(f"- Generate rows only: {generate_rows_only}")
        print(f"- Process columns: {process_columns}")
        
        # STEP 1: Generate new rows if requested
        new_rows_added = False
        if self.config.get("generate_rows", 0) > 0:
            print(f"Generating {self.config['generate_rows']} new rows...")
            new_rows = self.generate_new_rows(df, self.config["generate_rows"])
            if new_rows is not None and not new_rows.empty:
                # Ensure new rows have all the columns from the original dataframe
                for col in df.columns:
                    if col not in new_rows.columns:
                        new_rows[col] = None
                
                # Add the new rows to the dataframe
                df = pd.concat([df, new_rows], ignore_index=True)
                print(f"Added {len(new_rows)} new rows to the dataset")
                new_rows_added = True
        
        # STEP 2: Process columns (only if requested and there are columns to process)
        if process_columns:
            print("Processing columns...")
            
            # Add new columns that don't exist in the original CSV (if any)
            new_columns = []
            for column in self.config.get("column_context", {}):
                if column not in df.columns:
                    print(f"Creating new column: {column}")
                    df[column] = None  # Initialize with None values
                    new_columns.append(column)
            
            # Process each column
            for column in self.config["column_context"]:
                print(f"Processing column: {column}")
                batch_size = self.config["batch_sizes"].get(column, 10)
                
                # Check if we should ignore rows with existing values
                ignore_valued = self.config["ignore_valued_columns"].get(column, False)
                
                # Get the context columns for this column
                context_columns = self.config["column_context"][column]
                
                # Get transformation instructions if available
                transformation_instruction = self.config.get("transformation_instructions", {}).get(column, "")
                
                # Filter rows to process
                if ignore_valued:
                    rows_to_process = df[df[column].isna() | df[column].eq('')]
                else:
                    rows_to_process = df
                
                if len(rows_to_process) == 0:
                    print(f"No rows to process for column {column}")
                    continue
                
                # Process in batches
                for i in range(0, len(rows_to_process), batch_size):
                    batch = rows_to_process.iloc[i:i+batch_size]
                    print(f"Processing batch {i//batch_size + 1} for column {column} ({len(batch)} rows)")
                    
                    # Process the batch
                    updated_batch = self._process_batch(df, column, batch)
                    
                    # Update the original dataframe with the processed values
                    for idx, row in updated_batch.iterrows():
                        df.loc[idx, column] = row[column]
        
        # Save the processed file
        df.to_csv(output_path, index=False)
        
        # Print summary
        print("\nProcessing complete!")
        print(f"Original rows: {original_row_count}")
        if new_rows_added:
            print(f"New rows added: {len(df) - original_row_count}")
        if process_columns:
            print(f"New columns added: {len(new_columns)}")
            print(f"Columns processed: {len(self.config.get('column_context', {}))}")
        print(f"Total rows in output: {len(df)}")
        
        return {
            "original_rows": original_row_count,
            "new_rows": len(df) - original_row_count if new_rows_added else 0,
            "new_columns": new_columns,
            "processed_columns": list(self.config.get("column_context", {}).keys()) if process_columns else []
        }
        
    def generate_new_rows(self, df, num_rows):
        """Generate new rows based on existing data patterns"""
        if len(df) == 0:
            print("Cannot generate rows from an empty dataset")
            return None
            
        # Get a sample of existing rows to use as examples
        sample_size = min(5, len(df))
        sample_rows = df.sample(n=sample_size).to_dict(orient='records')
        
        # Convert sample rows to a readable format
        sample_text = ""
        for i, row in enumerate(sample_rows):
            sample_text += f"Row {i+1}:\n"
            for col, val in row.items():
                if pd.notnull(val):
                    sample_text += f"  {col}: {val}\n"
            sample_text += "\n"
        
        # Get dataset description if available
        dataset_description = self.config.get("dataset_description", "")
        
        # Get all column names to ensure they're included in the generated data
        all_columns = df.columns.tolist()
        columns_text = ", ".join(all_columns)
        
        # Build the prompt
        prompt = f"""
        You are generating synthetic data that matches the patterns in an existing dataset.
        
        {f"Dataset description: {dataset_description}" if dataset_description else ""}
        
        The dataset has the following columns: {columns_text}
        
        Here are some example rows from the dataset:
        {sample_text}
        
        Please generate {num_rows} new rows that follow the same patterns and relationships between columns.
        The data should be realistic and consistent with the examples.
        
        IMPORTANT: Make sure to include ALL columns in your response, even if some values are null or empty.
        
        Return the data as a JSON array of objects, where each object represents a row with column names as keys.
        Example format:
        [
          {{"column1": "value1", "column2": "value2", ...}},
          {{"column1": "value3", "column2": "value4", ...}}
        ]
        """
        
        try:
            response = self.client.chat.completions.create(
                model=os.getenv('OPENAI_MODEL', 'gpt-4o-mini'),
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that generates realistic synthetic data."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.7
            )
            
            # Extract text response
            result_text = response.choices[0].message.content.strip()
            
            # Find JSON in the response
            start_idx = result_text.find('[')
            end_idx = result_text.rfind(']') + 1
            
            if start_idx >= 0 and end_idx > start_idx:
                json_text = result_text[start_idx:end_idx]
                new_rows_data = json.loads(json_text)
                
                # Convert to DataFrame
                new_rows_df = pd.DataFrame(new_rows_data)
                
                # Ensure all columns from original DataFrame exist
                for col in df.columns:
                    if col not in new_rows_df.columns:
                        new_rows_df[col] = None
                
                return new_rows_df
            else:
                print("Could not find valid JSON array in the response")
                return None
                
        except json.JSONDecodeError as e:
            print(f"JSON parsing error when generating rows: {e}")
            print(f"Response text: {result_text}")
            return None
        except Exception as e:
            print(f"Error generating new rows: {e}")
            return None
        
    def _process_batch(self, df, column_name, batch):
        """Process a batch of rows for a specific column"""
        context_fields = self.config["column_context"].get(column_name, [])
        ignore_valued = self.config["ignore_valued_columns"].get(column_name, False)
        transformation_instruction = self.config["transformation_instructions"].get(column_name, "")
        
        prompt_parts = []
        index_mapping = list(batch.index)
        
        for idx, df_idx in enumerate(index_mapping):
            # Skip if we should ignore valued cells and this cell has a value
            if ignore_valued and pd.notnull(df.at[df_idx, column_name]) and df.at[df_idx, column_name] != '':
                continue
                
            context_values = " | ".join(f"{field}: {df.at[df_idx, field]}" 
                                       for field in context_fields 
                                       if field in df.columns and pd.notnull(df.at[df_idx, field]))
                                       
            existing_value = df.at[df_idx, column_name] if pd.notnull(df.at[df_idx, column_name]) else "Missing"
            prompt_parts.append(f"Entry {idx + 1}:\nContext: {context_values}\nCurrent {column_name}: {existing_value}\n")
        
        if not prompt_parts:
            return batch  # Return unchanged batch if no relevant rows to process
            
        # Build prompt
        prompt = f"""
        You are cleaning and enhancing a dataset. Each entry has various attributes that may need validation or filling in.
        Your task is to assess and correct the {column_name} values using the given context.
        
        {transformation_instruction if transformation_instruction else ""}
        
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
                model=os.getenv('OPENAI_MODEL', 'gpt-4o-mini'),
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
            
            # Create a copy of the batch to update
            updated_batch = batch.copy()
            
            # Update the batch copy
            for result in results:
                index = result.get("Index") - 1
                if 0 <= index < len(index_mapping):
                    df_idx = index_mapping[index]
                    updated_batch.at[df_idx, column_name] = result.get(column_name, batch.at[df_idx, column_name])
            
            return updated_batch
                    
        except json.JSONDecodeError:
            print(f"JSON parsing error for {column_name} batch. GPT response: {result_text}")
            return batch  # Return unchanged batch on error
        except Exception as e:
            print(f"Error processing {column_name} batch. Error: {e}")
            return batch  # Return unchanged batch on error 