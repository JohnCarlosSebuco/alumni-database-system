import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = {
  projectId: "alumni-database-system-8329f",
  clientEmail: "firebase-adminsdk-fbsvc@alumni-database-system-8329f.iam.gserviceaccount.com",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCVhEbJK9khOene\nD9GyN4YT7lJaLjbi5XUMQ92NG3ChzuymEP3PyukiJXiHlpMOzQFfGvrsFpBNavYe\ny/q9heeKNS6Nvn3ZtJ2Ioe4oxA31L4VQuOAIjTNq2gZvUfeT8Hoi2hwDbqPgi3Ii\nbui3GhrTEEGOMRH3Urxve/19rKedXmbUdKCFdBYrXvQKAfsHDW7m8s2nkleyWl9d\ns9Z0HeQJmfE61LaUmbu4sF3Xbi8Sba6IvbJKNNojgo1lCMw/NCTPqKbxklV8U57d\ngYJeJq03JvspsGRY1dL56UAJx5eXD4t0sJu52yovUHkDMFlqTKtgic+y6g+YcGTJ\ndk81tmYDAgMBAAECggEAApn5KVLnaj6VJR6LDqMMreE9qZNzs+HOLPuZTmLu+wrl\nOFZ6xlg2U1zp06tCKzN4zKMb0yF7qLQJKD5OC2j+dg4Br+0akcAALtXXA0O2AnXS\nENrrMdZTGvyNSveya1xAo8V04i3VNdRlAo84mVlEW1vFVfFy6bgnF8F8PZ/UR1an\nMoyNJWmxMls/6V/9enxc9fUnCB7ART47A2Uh8or5w6xZRdrRgZxkJjOHOGu7Azk3\nY7MxlFcoboDgEsrn1eIv9mq8cgK6qqEXyNsr6lK4pRo+mUhEDs6qsghX5IXmNK12\naBdcjuCScuSiTVrFCEn8tH3gLZrBImk34NZexqkA8QKBgQDG1jZE6/Gh4MdKSSEN\npY+c7JJsp1uCn06ToKyfg9vpGydKclOkAHGJEk3/9LMbmhm9fy2/8SiAW2rHvq3r\nlUGFJrkweRKQjN3XgZdxvpTepqEBDhmzSzsgSvN8hs7wu/+cAUmWf/MqH82XO4qP\nvUxZz5jYGzKz3bocwN1ie0x8dQKBgQDAgEGiKpu38+W7D3o7qIjpxIiyLa1Y9NmT\n0w+jB8itry0ZXQq9z9WR1dv8ZdIaT80qPaUVaT1P2eNdbPuL4V0Cb04jfiL+KvnS\nuVmx/t+WzG1IynHDq6+HOqAl18CuvodByLPIns7g8T+lnXTjGIjqUInNDaklEsRk\nb+DJ/LlplwKBgH4sYmWb30ocq/ncq+fP/nDSwhvGm1ApLSCK3d+fOcYTH/yizaaN\nTX5wqiRYr+s8/0Z7VJmvO0cwO3Mi8ZRDsz7+EpfKzFgDu6ZMKsDX8fnTfOmBfBeF\nDrDwPs/vb5PdiFcDjiG9cZ1ybvCfrM6HjdKT5GaF48e1VKt4S0N6AFAdAoGAVKQQ\nN82kSm3jRSy5AiJIkQDpWe7bmZGPWYAkD/sMMdIkclKGto77yPPPllru1sLf4wLX\n42IyozmazylsMUUWMEvgf5qmqDsdPZph5fG7PgMEyky5WN/UfhE4+Wq0PiFoN3SY\nGE47iIyK/7cL/g57pQtki9TF2pc14zOOE0IcBGECgYAsCi3NDdrhp9JVxkBchFwX\nWFYUS1nN9x2G4DA7FBiKLsRoRAMqWkferZt0VKZrhjUAGR/MfJW5KFJ/A5E4BN22\n1AzRzli0raUGqodIx5RsU/FJ9rzHoQ1qtsWx/T3EZTnijDbvAQOZvxTf4QKbNJLF\nWfqYwgnAi/1sIUuGZOIptQ==\n-----END PRIVATE KEY-----\n",
};

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// Southern Luzon State University — colleges and programs
const departments = [
  {
    id: "coe",
    name: "College of Engineering",
    code: "COE",
    courses: [
      "Bachelor of Science in Civil Engineering",
      "Bachelor of Science in Electrical Engineering",
      "Bachelor of Science in Mechanical Engineering",
      "Bachelor of Science in Electronics Engineering",
    ],
  },
  {
    id: "cit",
    name: "College of Industrial Technology",
    code: "CIT",
    courses: [
      "Bachelor of Science in Industrial Technology major in Computer Technology",
      "Bachelor of Science in Industrial Technology major in Electrical Technology",
      "Bachelor of Science in Industrial Technology major in Electronics Technology",
      "Bachelor of Science in Industrial Technology major in Mechanical Technology",
      "Bachelor of Technical-Vocational Teacher Education",
    ],
  },
  {
    id: "cas",
    name: "College of Arts and Sciences",
    code: "CAS",
    courses: [
      "Bachelor of Arts in Communication",
      "Bachelor of Science in Biology",
      "Bachelor of Science in Mathematics",
      "Bachelor of Science in Environmental Science",
    ],
  },
  {
    id: "cbm",
    name: "College of Business Management",
    code: "CBM",
    courses: [
      "Bachelor of Science in Business Administration major in Marketing Management",
      "Bachelor of Science in Business Administration major in Financial Management",
      "Bachelor of Science in Business Administration major in Human Resource Development Management",
      "Bachelor of Science in Accountancy",
      "Bachelor of Science in Entrepreneurship",
    ],
  },
  {
    id: "coed",
    name: "College of Education",
    code: "COED",
    courses: [
      "Bachelor of Secondary Education major in English",
      "Bachelor of Secondary Education major in Mathematics",
      "Bachelor of Secondary Education major in Science",
      "Bachelor of Secondary Education major in Filipino",
      "Bachelor of Elementary Education",
      "Bachelor of Early Childhood Education",
    ],
  },
  {
    id: "cnhs",
    name: "College of Nursing and Health Sciences",
    code: "CNHS",
    courses: [
      "Bachelor of Science in Nursing",
      "Bachelor of Science in Midwifery",
    ],
  },
  {
    id: "ccje",
    name: "College of Criminal Justice Education",
    code: "CCJE",
    courses: [
      "Bachelor of Science in Criminology",
    ],
  },
  {
    id: "ca",
    name: "College of Agriculture",
    code: "CA",
    courses: [
      "Bachelor of Science in Agriculture",
      "Bachelor of Science in Agribusiness Management",
      "Bachelor of Science in Forestry",
    ],
  },
];

async function seed() {
  console.log("Seeding departments...");
  const batch = db.batch();
  for (const dept of departments) {
    const { id, ...data } = dept;
    const ref = db.collection("departments").doc(id);
    batch.set(ref, data);
  }
  await batch.commit();
  console.log(`✓ Seeded ${departments.length} departments successfully.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
