import AWS from 'aws-sdk';

AWS.config.update({ region: 'us-east-1' }); 

const timestreamWrite = new AWS.TimestreamWrite();
const timestreamQuery = new AWS.TimestreamQuery();

const DATABASE_NAME = 'sampleDB';
const TABLE_NAME = 'noor_test';

async function createDatabase() {
    try {
        await timestreamWrite.createDatabase({ DatabaseName: DATABASE_NAME }).promise();
        console.log(`Database ${DATABASE_NAME} created.`);
    } catch (error) {
        if (error.code !== 'ConflictException') {
            console.error('Error creating database:', error);
        }
    }
}

async function createTable() {
    try {
        await timestreamWrite.createTable({
            DatabaseName: DATABASE_NAME,
            TableName: TABLE_NAME,
            RetentionProperties: {
                MemoryStoreRetentionPeriodInHours: '24',
                MagneticStoreRetentionPeriodInDays: '7'
            }
        }).promise();
        console.log(`Table ${TABLE_NAME} created.`);
    } catch (error) {
        if (error.code !== 'ConflictException') {
            console.error('Error creating table:', error);
        }
    }
}

async function writeRecords() {
    const timestamp = Date.now().toString();
    const records = [
        {
            Dimensions: [{ Name: 'device_id', Value: "device1" }],
            MeasureName: 'temperature',
            MeasureValue: '22.5',
            MeasureValueType: 'DOUBLE',
            Time: timestamp
        },
        // {
        //     Dimensions: [{ Name: 'device_id', Value: "device2" }],
        //     MeasureName: 'humidity',
        //     MeasureValue: '22.5',
        //     MeasureValueType: 'DOUBLE',
        //     Time: timestamp
        // }
    ];

    try {
        await timestreamWrite.writeRecords({
            DatabaseName: DATABASE_NAME,
            TableName: TABLE_NAME,
            Records: records
        }).promise();
        console.log('Record written successfully.');
    } catch (error) {
        console.error('Error writing records:', error);
    }
}

async function queryRecords() {
    const query = `SELECT * FROM "${DATABASE_NAME}"."${TABLE_NAME}" ORDER BY time DESC LIMIT 2`;
    try {
        const result = await timestreamQuery.query({ QueryString: query }).promise();
        console.log('Query Results:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error querying records:', error);
    }
}

(async () => {
    // await createDatabase();
    // await createTable();
    await writeRecords();
    await queryRecords();
})();