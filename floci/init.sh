#!/usr/bin/env sh

echo "Waiting for Floci to be ready..."
until aws sqs list-queues > /dev/null 2>&1; do
  sleep 1
done
echo "Floci is ready"

echo "Configuring SQS and SNS"
echo "========================"

AWS_REGION=${AWS_REGION:-eu-west-2}

create_topic() {
  local TOPIC_NAME=$1
  aws sns create-topic --name "${TOPIC_NAME}" --region "${AWS_REGION}"
}

create_topic "fcp_event_publisher"

echo "Done! SQS and SNS configured."
