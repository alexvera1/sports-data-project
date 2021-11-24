#!/bin/bash

API="http://localhost:4741"
URL_PATH="/players"

curl "${API}${URL_PATH}/${ID}" \
  --include \
  --request PATCH \
  --header "Content-Type: application/json" \
--header "Authorization: Bearer ${TOKEN}" \
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
