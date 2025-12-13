import admin from 'firebase-admin'
import { resolve } from 'path'
import { readFileSync } from 'fs'
const serviceAccountPath = resolve(
  process.cwd(),
  '.credentials/firebase-admin.json'
)
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
})
const auth = admin.auth()

export { auth }
