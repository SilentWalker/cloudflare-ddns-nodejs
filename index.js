require("dotenv").config();
const https = require("node:https");
const cf = require("cloudflare");

const { EMAIL, CFKEY, CFTOKEN, ZONE, SUBDOMAIN } = process.env;
const initOptions = {};

// use env vars for authentication
if (CFTOKEN) {
  Object.assign(initOptions, {
    token: CFTOKEN,
  });
} else if (EMAIL && CFKEY) {
  Object.assign(initOptions, {
    email: EMAIL,
    key: CFKEY,
  });
} else {
  throw new Error("No authentication method provided");
}
const CFCLIENT = cf(initOptions);

// get local machine's public IP
const getPublicIP = () => {
  return new Promise((resolve, reject) => {
    const CF_TRACE_URL = "https://www.cloudflare.com/cdn-cgi/trace";
    // set https agent with ipv4 family preference
    const agent = new https.Agent({
      family: 4,
    });
    https.get(CF_TRACE_URL, { agent }, (res) => {
      let data = "";
      res
        .on("data", (chunk) => {
          data += chunk;
        })
        .on("end", () => {
          const entries = data.split("\n").map((_) => _.split("="));
          const traceResp = Object.fromEntries(entries);
          resolve(traceResp);
        })
        .on("error", (err) => {
          console.log(err);
          reject();
        });
    });
  });
};

// get current DNS record
const getDNSRecord = async () => {
  const records = await CFCLIENT.dnsRecords.browse(ZONE);
  const record = records.result.find((_) => {
    const subdomain = _.name.split(".")[0];
    return subdomain === SUBDOMAIN;
  });
  return record;
};

// create cloudflare dns record
const createDNSRecord = async (ip) => {
  const record = await CFCLIENT.dnsRecords.add(ZONE, {
    type: "A",
    name: SUBDOMAIN,
    content: ip,
    ttl: 60,
  });
  return record;
};

// update cloudflare dns record
const updateDNSRecord = async (record, ip) => {
  const updatedRecord = await CFCLIENT.dnsRecords.edit(ZONE, record.id, {
    type: "A",
    name: SUBDOMAIN,
    content: ip,
    ttl: 60,
  });
  return updatedRecord;
};

// main function
const main = async () => {
  const { ip } = await getPublicIP();
  const record = await getDNSRecord();
  if (record) {
    console.log(
      `Current DNS record: ${
        record.content
      }, Current IP: ${ip}, ${new Date().toISOString()}`
    );
    if (record.content !== ip) {
      console.log("Updating DNS record...");
      const res = await updateDNSRecord(record, ip);
      console.log("DNS record update result: %o", res);
    } else {
      console.log("No update needed");
    }
  } else {
    console.log("Creating DNS record...");
    const res = await createDNSRecord(ip);
    console.log("DNS record create result: %o", res);
  }
  console.log("Done");

  // run again in 5 minutes
  setTimeout(() => {
    main();
  }, 5 * 60 * 1000);
};

main();
