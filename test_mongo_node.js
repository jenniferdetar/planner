const { MongoClient } = require('mongodb');
const user = "jennifermsamples_db_user";
const password = "al-gjS6jf_q01hajcZ9ZZtUaCORZp0eUxBfYy4uL5q1dN9";
const MONGODB_URI = `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(password)}@cluster0.tnqqlzj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

async function test() {
    const client = new MongoClient(MONGODB_URI, {
        tlsAllowInvalidCertificates: true
    });
    try {
        await client.connect();
        console.log('SUCCESS');
        await client.close();
    } catch (e) {
        console.error('FAILED', e);
    }
}
test();
