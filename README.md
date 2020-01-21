# Crypto Trade API

1. Create an AWS account and configure AWS CLI in your machine with your credentials.

2. Create an account in Binance and generate API key with trade permissions.

3. Create a vault in AWS Secrets Manager (Use the name in env.yml "SECRETS_ID").
3.1 Create itens bellow in your AWS Secrets Manager:
  - BINANCE_API_KEY: `<Put key id here>`
  - BINANCE_API_SECRET: `Put secret here`
  - AUTH_TOKEN: `Create your unique API key and put here. It will be used to authenticate in this API`

4. Run commands bellow to test the code locally:
  - `npm ci`
  - `npm run dev`

5. Run command bellow to deploy API in AWS:
  - `npm deploy`

6. To call API use the body example bellow:


```bash
POST {HOST}/api/v1/trade?token={Your API Key}
{
  "action": "buy",
  "p1": "ETH",
  "p2": "BTC",
  "amount": "0.15"
}
```

### Info

- action: Could be "buy" or "sell"
- p1: Is the coin code that will be traded
- p2: Is the coin code source/destiny
- amount: Total amount of p1.

> In the POST example above, you are buying 0.15 ETH using BTC as source.

> If you change the action to "sell", you will sell 0.15 ETH to BTC.

> PS: You can call the API in test mode, where binance will not do a real trade.
To active this mode, put a parameter test=true in URL:

```bash
POST {HOST}/api/v1/trade?token={Your API Key}&test=true
```
