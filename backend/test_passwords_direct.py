import bcrypt

hash_abc = b"$2b$12$fL0TBic64PIuJicygpLEW.RYTSk6SrXLhLBdVymUG4vN..h3F7SJm"
hash_demo = b"$2b$12$oiqjjY3WHTa5V293.SACKePtj5xVA9kj1ahMbj8vabhqX5q9uKbeG"

passwords_to_test = ["password123", "abc", "abc123", "password", "admin", "123456", "12345678", "abcabc"]

for pwd in passwords_to_test:
    print(f"Testing password: {pwd}")
    pwd_bytes = pwd.encode('utf-8')
    if bcrypt.checkpw(pwd_bytes, hash_abc):
        print(f"MATCH found for abc@gmail.com: {pwd}")
    if bcrypt.checkpw(pwd_bytes, hash_demo):
        print(f"MATCH found for demo@finsmart.com: {pwd}")
