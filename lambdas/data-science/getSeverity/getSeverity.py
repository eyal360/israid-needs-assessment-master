import json
import logging
import boto3
from botocore.exceptions import ClientError
from textblob import TextBlob

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def severity(text):
    """
    Calculate severity metric on some text segment

    :param text: text to gauge severity on
    :returns: Severity score: 0.8*[normalized polarity] + 0.2*[1-subjectivity]
    """
    testimonial = TextBlob(text)
    sentiment = testimonial.sentiment
    # Normalize Polarity and weigh in objectivity to create a 0-1 scale measure
    # Higher score = a more severe, objective report
    sev = 0.8 * ((-1 * sentiment.polarity - (-1)) / 2) + 0.2 * (1 - sentiment.subjectivity)
    return sev

def calac_measure(item):
    total_grade = 0.0
    if item["question"]["type"] == "yes-no":
                if item["answer"]["notes"] != "":
                    if item["answer"]["value"] is True:
                        txt_severity = severity(item["answer"]["notes"])
                        total_grade += 2 * txt_severity

                if item['question']['order'] == 1 :
                    if item["answer"]["value"] is True:
                        total_grade *= 1.5

    if item["question"]["type"] == "text":
        txt_severity = severity(item["question"]["type"])
        total_grade += txt_severity

    return total_grade

def create_measure(subcat, example_JSON):
    total_grade = 0.0
    quest_counter = 0
    for item in example_JSON:
        if item["subcategory"]["name"] == subcat:
            total_grade += calac_measure(item)
            quest_counter += 1
    normalized_grade = float(total_grade / quest_counter)
    return normalized_grade


def lambda_handler(event, context):
    try:
        all_answers = json.loads(event['body']) # list of dicts like example above

        sev_dict = get_severity(all_answers)   # UPDATE THIS FUNCTION TO RETURN A DICT OF ['id','severity']

        return {
            'statusCode': 200,
            'body': json.dumps({'severity': str(sev_dict)})
        }
    except ClientError as e:
        logger.error(f"Client error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error_message': 'Internal server error'})
        }
    except Exception as e:
        logger.error(f"Error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error_message': 'Internal server error'})
        }


# Expected Input Format ######
#event = { 
#         [
#           'answer.id': {
#                     'value': answer.value,
#                     'notes': answer.notes
#                     }, 
#           'answer.id': {
#                     'value': answer.value,
#                     'notes': answer.notes
#                     }
#          ]
#       }
#lambda_handler(event, {})