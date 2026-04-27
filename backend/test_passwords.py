from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

hash_abc = "$2b$12$fL0TBic64PIuJicygpLEW.RYTSk6SrXLhLBdVymUG4vN..h3F7SJm"
hash_demo = "$2b$12$oiqjjY3WHTa5V293.SACKePtj5xVA9kj1ahMbj8vabhqX5q9uKbeG"

passwords_to_test = ["password123", "abc", "abc123", "password", "admin"]

for pwd in passwords_to_test:
    print(f"Testing password: {pwd}")
    if pwd_context.verify(pwd, hash_abc):
        print(f"MATCH found for abc@gmail.com: {pwd}")
    if pwd_context.verify(pwd, hash_demo):
        print(f"MATCH found for demo@finsmart.com: {pwd}")
