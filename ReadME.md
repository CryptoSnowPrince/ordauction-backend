# ordauction-backend

## API_URL

```text
https://ordauction.org/api
```

## API_LIST

```text
POST
/users/getUserInfo
ordWallet: string
actionDate: date
 
GET
/users/getNotify?ordWallet=ordWallet

POST
/users/removeNotify
ordWallet: ordWallet
removeAll: false(one)/true(multiple)
type: Number
link: string
content: string
notifyDate: Date
```
