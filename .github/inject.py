"""
inject.py - 將 GitHub Secrets 注入建置產物
在 CI/CD 流程中，Build 時使用佔位符，部署前用此腳本替換為真實值。
"""
import os
import glob

# 佔位符與對應的環境變數映射
REPLACEMENTS = {
    "__FIREBASE_API_KEY__": "VITE_FIREBASE_API_KEY",
    "__FIREBASE_AUTH_DOMAIN__": "VITE_FIREBASE_AUTH_DOMAIN",
    "__FIREBASE_PROJECT_ID__": "VITE_FIREBASE_PROJECT_ID",
    "__FIREBASE_STORAGE_BUCKET__": "VITE_FIREBASE_STORAGE_BUCKET",
    "__FIREBASE_MESSAGING_SENDER_ID__": "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "__FIREBASE_APP_ID__": "VITE_FIREBASE_APP_ID",
}

# 掃描 dist 目錄下所有 JS 與 HTML 檔案
target_files = glob.glob("dist/**/*.js", recursive=True) + \
               glob.glob("dist/**/*.html", recursive=True)

replaced_count = 0
missing_secrets = []

for placeholder, env_key in REPLACEMENTS.items():
    value = os.environ.get(env_key, "")
    if not value:
        missing_secrets.append(env_key)
        continue

    for filepath in target_files:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        if placeholder in content:
            content = content.replace(placeholder, value)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            replaced_count += 1
            print(f"  ✅ {placeholder} → {filepath}")

if missing_secrets:
    print(f"\n⚠️  以下 Secret 未設定，請至 GitHub Repo Settings → Secrets and variables → Actions 新增：")
    for key in missing_secrets:
        print(f"     - {key}")
    exit(1)

print(f"\n✅ 注入完成，共替換 {replaced_count} 個檔案")
