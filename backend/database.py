import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get MongoDB connection string
MONGO_URL = os.getenv("MONGO_DB")

if not MONGO_URL:
    logger.error("MONGO_DB environment variable not set.")
    raise EnvironmentError("MONGO_DB environment variable not set.")

logger.info("Connecting to MongoDB...")

try:
    # Create client with connection string
    client = AsyncIOMotorClient(MONGO_URL)

    # The database name should match what's in your MongoDB Atlas setup
    db = client.get_database("crochedb")

    # Test the connection
    client.admin.command('ping')
    logger.info("Successfully connected to MongoDB!")

except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {str(e)}")
    raise