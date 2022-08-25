# CLOUDFLARE-DDNS-NODEJS

Automatically set your local ip in cloudflare dns record, the record will update every 5 minues

## Authentication methods

You can choose to use either the newer API tokens, or the traditional API keys

To generate a new API tokens, go to your [Cloudflare Profile](https://dash.cloudflare.com/profile/api-tokens) and create a token capable of **Edit DNS**.
Then set the value in `.env` file:

- CFTOKEN="Your cloudflare API token, including the capability of **Edit DNS**"

Alternatively, you can use the traditional API keys by setting appropriate values for:

- CFKEY="Your cloudflare API Key"
- EMAIL="The email address you use to sign in to cloudflare"

At last, you need to set the cloudflare zoon id and the subdomain

- ZONE="The ID of the zone that will get the records. From your dashboard click into the zone. Under the overview tab, scroll down and the zone ID is listed in the right rail"
- SUBDOMAIN="The subdomain you want to update the A records. IMPORTANT! Only write subdomain name. Do not include the base domain name. (e.g. foo or an empty string to update the base domain)"

## Running

### Node.js

`npm install`
`node index.js`

### Docker

`sudo ./build.sh`
edit docker-compose.yml, replace volumes path with your current path
`sudo docker compose up -d`
