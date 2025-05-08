import subprocess
import shutil

def deploy_firestore_indexes():
    if not shutil.which("firebase"):
        print("❌ Firebase CLI not found. Please install with: npm install -g firebase-tools")
        return

    print("🚀 Deploying Firestore indexes...")
    try:
        subprocess.run(["firebase", "deploy", "--only", "firestore:indexes"], check=True)
        print("✅ Firestore indexes deployed successfully.")
    except subprocess.CalledProcessError as e:
        print("❌ Failed to deploy Firestore indexes:", e)

if __name__ == "__main__":
    deploy_firestore_indexes()
