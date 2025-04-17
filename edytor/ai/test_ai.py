from django.test import TestCase
from apiconnect import refactor_code, comment_code

sample_code = '''
def calc(a,b):
 return a+b
'''

print("=== Refactored Code ===")
print(refactor_code(sample_code))

print("\n=== Commented Code ===")
print(comment_code(sample_code))
