#!/usr/bin/env python
import os
import time
import psycopg2

# Get environment variables
db_host = "db"  # Database service name in docker-compose
db_name = os.environ.get("POSTGRES_DB", "task_manager")
db_user = os.environ.get("POSTGRES_USER", "postgres")
db_password = os.environ.get("POSTGRES_PASSWORD", "postgres")

# Function to check the database connection
def check_database():
    try:
        conn = psycopg2.connect(
            dbname=db_name,
            user=db_user,
            password=db_password,
            host=db_host
        )
        conn.close()
        return True
    except Exception as e:
        print(f"Cannot connect to the database: {e}")
        return False

# Wait for the database to be available
def wait_for_db():
    """
    Wait for the database to be available.
    """
    time.sleep(2)
    print("Waiting for the database...")
    retries = 30  # Maximum number of attempts
    for i in range(retries):
        if check_database():
            print("Database is available!")
            return True
        time.sleep(2)  # Wait 2 seconds between attempts
    
    print("Error! Cannot connect to the database after several attempts.")
    return False

if __name__ == "__main__":
    wait_for_db() 