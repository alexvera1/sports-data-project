#!/bin/bash

API="http://localhost:4741"
URL_PATH="/players"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \git 
  --data '{
    "player": {
      "name": "'"${NAME}"'",
      "position": "'"${POSITION}"'"
      "number": "'"${NUMBER}"'",
      "college": "'"${COLLEGE}"'"
      "draft": "'"${DRAFT}"'"
    }
  }'

echo
