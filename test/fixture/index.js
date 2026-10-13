// A tiny app for the self-test: it reads two env vars and .env.example declares one,
// so a dry run reports API_KEY as missing.
const databaseUrl = process.env.DATABASE_URL;
const apiKey = process.env.API_KEY;

module.exports = { databaseUrl, apiKey };
