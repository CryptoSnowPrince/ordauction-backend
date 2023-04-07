# ordinalart-inscribe-backend

## API_URL

```text
https://inscribe.ordinal.art/api
```

## API_LIST

```text
POST
https://inscribe.ordinal.art/api/users/getUserInfo
ordWallet: string
actionDate: date
 
POST
https://inscribe.ordinal.art/api/users/getUserInscriptions
ordWallet: string

GET
https://inscribe.ordinal.art/api/users/getNotify?ordWallet=ordWallet

POST
https://inscribe.ordinal.art/api/users/removeNotify
ordWallet: ordWallet
removeAll: false(one)/true(multiple)
type: Number
link: string
content: string
notifyDate: Date
```
