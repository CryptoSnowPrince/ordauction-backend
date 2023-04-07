# ordinalart-inscribe-backend

## API_URL

```text
https://inscribe.ordinal.art/api
```

## API_LIST

```text
POST
https://inscribe.ordinal.art/api/users/getUserInfo
uuid: string
actionDate: date
 
POST
https://inscribe.ordinal.art/api/users/getUserInscriptions
uuid: string

GET
https://inscribe.ordinal.art/api/users/getNotify?uuid=uuid

POST
https://inscribe.ordinal.art/api/users/removeNotify
uuid: uuid
removeAll: false(one)/true(multiple)
type: Number
link: string
content: string
notifyDate: Date
```
