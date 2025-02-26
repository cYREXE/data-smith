import pandas as pd
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import time

load_dotenv()

# Set your OpenAI API key
api_key = os.getenv('OPENAI_API_KEY')

client = OpenAI(api_key=api_key)

# Load your dataset
df = pd.read_csv('megaGymDataset.csv')

# Ensure necessary columns exist
df['Muscles'] = df.get('Muscles', '')
df['HowTo'] = df.get('HowTo', '')

# Allowed values for Type and BodyPart
VALID_TYPES = {'Strength', 'Cardio', 'Mobility', 'Hypertrophy', 'Power'}
VALID_BODYPARTS = {'Legs', 'Back', 'Chest', 'Abdominals', 'Shoulders', 'Arms', 'Full Body'}

# Define column-specific context
COLUMN_CONTEXT = {
    "Type": ["Title", "Desc"],  # Use Title and Description for Type classification
    "BodyPart": ["Title", "Desc"],  # Use Title and Description for BodyPart classification
    "Muscles": ["Title", "Desc", "BodyPart"],  # Use Title, Description, and BodyPart for muscle classification
    "Desc": ["Title"],  # Use Title for filling missing descriptions
    "HowTo": ["Title", "Desc"]  # Use Title and Description for step-by-step guide
}

# Define batch sizes per column
BATCH_SIZES = {
    "Type": 20,
    "BodyPart": 25,
    "Muscles": 12,
    "Desc": 8,
    "HowTo": 8
}

IGNORE_VALUED_COLUMNS = {
    "Type": False,
    "BodyPart": True,
    "Muscles": True,
    "Desc": True,
    "HowTo": True
}

# GPT function to assess and fill in a batch of column values
def assess_and_fill_column(column_name, batch):
    context_fields = COLUMN_CONTEXT.get(column_name, [])
    prompt_parts = []
    index_mapping = list(batch.index)
    
    for idx, df_idx in enumerate(index_mapping):
        if IGNORE_VALUED_COLUMNS[column_name] and pd.notnull(df.at[df_idx, column_name]) and df.at[df_idx, column_name] != '':
            continue
        context_values = " | ".join(f"{field}: {df.at[df_idx, field]}" for field in context_fields if pd.notnull(df.at[df_idx, field]))
        existing_value = df.at[df_idx, column_name] if pd.notnull(df.at[df_idx, column_name]) else "Missing"
        prompt_parts.append(f"Entry {idx + 1}:\nContext: {context_values}\nCurrent {column_name}: {existing_value}\n")
    
    if not prompt_parts:
        return  # Skip if no relevant rows to process

    # Build GPT prompt
    prompt = f"""
    You are cleaning and enhancing an exercise dataset. Each exercise has various attributes that may need validation or filling in.
    Your task is to assess and correct the {column_name} values using the given context.
    
    Here are multiple exercises:
    {''.join(prompt_parts)}
    
    Respond in the following format (not JSON):
    [
      {{"Index": 1, "{column_name}": "<Corrected Value>"}},
      {{"Index": 2, ...}}
    ]
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
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
        print(f"JSON parsing error for {column_name} batch starting at index {batch.index[0]}. GPT response: {result_text}")
    except Exception as e:
        print(f"Error processing {column_name} batch starting at index {batch.index[0]}. Error: {e}")

# Estimate time per column
total_batches = sum(len(df) // BATCH_SIZES[col] + 1 for col in BATCH_SIZES)
estimated_time_per_batch = 2  # Adjust based on response times
estimated_total_time = total_batches * estimated_time_per_batch
print(f"Estimated total processing time: {estimated_total_time // 60} minutes {estimated_total_time % 60} seconds")

# Process each column with its respective batch size
for column, batch_size in BATCH_SIZES.items():
    print(f"Processing column: {column}")
    start_time = time.time()
    for i in range(0, len(df), batch_size):
        batch = df.iloc[i:i + batch_size]
        assess_and_fill_column(column, batch)
        elapsed_time = time.time() - start_time
        print(f"Processed {i + batch_size}/{len(df)} in column {column}. Time elapsed: {elapsed_time:.2f} seconds")



# Save updated dataset
df.to_csv('improved_megaGymDataset2.csv', index=False)

print("Dataset processing complete. Saved as 'improved_megaGymDataset2.csv'")
