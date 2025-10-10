#!/usr/bin/env python3
"""
Security Testing Suite
Automated tests for security vulnerabilities
"""

import requests
import time
import json
import sys
from urllib.parse import urljoin
import threading
from concurrent.futures import ThreadPoolExecutor

class SecurityTester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.results = []
    
    def log_result(self, test_name, status, message):
        """Log test result"""
        result = {
            'test': test_name,
            'status': status,
            'message': message,
            'timestamp': time.time()
        }
        self.results.append(result)
        
        status_symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_symbol} {test_name}: {message}")
    
    def test_sql_injection(self):
        """Test SQL injection vulnerabilities"""
        print("\n🔍 Testing SQL Injection Protection...")
        
        sql_payloads = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "admin'/**/OR/**/1=1#",
            "' UNION SELECT * FROM users --",
            "1'; INSERT INTO users VALUES('hacker','pass'); --",
            "' OR 1=1 LIMIT 1 --",
            "admin'--",
            "admin' #",
            "admin'/*",
            "' or 1=1#",
            "' or 1=1--",
            "' or 1=1/*",
            "') or '1'='1--",
            "') or ('1'='1--"
        ]
        
        endpoints = [
            ('/contact', 'POST', {'name': 'payload', 'email': 'test@test.com', 'subject': 'test', 'message': 'test'}),
            ('/admin/login', 'POST', {'username': 'payload', 'password': 'test'}),
            ('/api/projects', 'GET', {'type': 'payload'})
        ]
        
        vulnerabilities_found = 0
        
        for payload in sql_payloads:
            for endpoint, method, data in endpoints:
                try:
                    # Replace 'payload' with actual SQL injection payload
                    test_data = {}
                    for key, value in data.items():
                        test_data[key] = payload if value == 'payload' else value
                    
                    if method == 'POST':
                        response = self.session.post(urljoin(self.base_url, endpoint), data=test_data, timeout=5)
                    else:
                        response = self.session.get(urljoin(self.base_url, endpoint), params=test_data, timeout=5)
                    
                    # Check for SQL error messages
                    error_indicators = [
                        'mysql_fetch_array',
                        'ORA-01756',
                        'Microsoft OLE DB Provider for ODBC Drivers',
                        'java.sql.SQLException',
                        'PostgreSQL query failed',
                        'Warning: mysql_',
                        'MySQLSyntaxErrorException',
                        'valid MySQL result',
                        'check the manual that corresponds to your MySQL server version'
                    ]
                    
                    response_text = response.text.lower()
                    for indicator in error_indicators:
                        if indicator.lower() in response_text:
                            vulnerabilities_found += 1
                            self.log_result(
                                "SQL Injection",
                                "FAIL",
                                f"Potential SQL injection in {endpoint} with payload: {payload[:50]}..."
                            )
                            break
                
                except requests.RequestException as e:
                    self.log_result("SQL Injection", "WARNING", f"Request failed for {endpoint}: {str(e)}")
        
        if vulnerabilities_found == 0:
            self.log_result("SQL Injection", "PASS", "No SQL injection vulnerabilities detected")
        else:
            self.log_result("SQL Injection", "FAIL", f"Found {vulnerabilities_found} potential SQL injection vulnerabilities")
    
    def test_xss_protection(self):
        """Test XSS protection"""
        print("\n🔍 Testing XSS Protection...")
        
        xss_payloads = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "<svg onload=alert('XSS')>",
            "javascript:alert('XSS')",
            "<iframe src=javascript:alert('XSS')></iframe>",
            "<body onload=alert('XSS')>",
            "<input onfocus=alert('XSS') autofocus>",
            "<select onfocus=alert('XSS') autofocus>",
            "<textarea onfocus=alert('XSS') autofocus>",
            "<keygen onfocus=alert('XSS') autofocus>",
            "<video><source onerror=alert('XSS')>",
            "<audio src=x onerror=alert('XSS')>",
            "<details open ontoggle=alert('XSS')>",
            "'-alert('XSS')-'",
            "\";alert('XSS');//"
        ]
        
        vulnerabilities_found = 0
        
        for payload in xss_payloads:
            try:
                # Test contact form
                response = self.session.post(urljoin(self.base_url, '/contact'), data={
                    'name': payload,
                    'email': 'test@test.com',
                    'subject': 'Test',
                    'message': 'Test message'
                }, timeout=5)
                
                # Check if payload appears unescaped in response
                if payload in response.text:
                    vulnerabilities_found += 1
                    self.log_result(
                        "XSS Protection",
                        "FAIL",
                        f"Potential XSS vulnerability with payload: {payload[:50]}..."
                    )
            
            except requests.RequestException as e:
                self.log_result("XSS Protection", "WARNING", f"Request failed: {str(e)}")
        
        if vulnerabilities_found == 0:
            self.log_result("XSS Protection", "PASS", "No XSS vulnerabilities detected")
        else:
            self.log_result("XSS Protection", "FAIL", f"Found {vulnerabilities_found} potential XSS vulnerabilities")
    
    def test_rate_limiting(self):
        """Test rate limiting"""
        print("\n🔍 Testing Rate Limiting...")
        
        # Test login rate limiting
        login_blocked = False
        for i in range(10):
            try:
                response = self.session.post(urljoin(self.base_url, '/admin/login'), data={
                    'username': 'testuser',
                    'password': 'wrongpassword'
                }, timeout=5)
                
                if response.status_code == 429:
                    login_blocked = True
                    break
                
                time.sleep(0.1)  # Small delay between requests
            
            except requests.RequestException as e:
                self.log_result("Rate Limiting", "WARNING", f"Request failed: {str(e)}")
                break
        
        if login_blocked:
            self.log_result("Rate Limiting", "PASS", "Login rate limiting is working")
        else:
            self.log_result("Rate Limiting", "FAIL", "Login rate limiting not detected")
        
        # Test contact form rate limiting
        contact_blocked = False
        for i in range(5):
            try:
                response = self.session.post(urljoin(self.base_url, '/contact'), data={
                    'name': 'Test User',
                    'email': 'test@test.com',
                    'subject': f'Test Subject {i}',
                    'message': 'Test message'
                }, timeout=5)
                
                if response.status_code == 429:
                    contact_blocked = True
                    break
                
                time.sleep(0.1)
            
            except requests.RequestException as e:
                self.log_result("Rate Limiting", "WARNING", f"Contact form request failed: {str(e)}")
                break
        
        if contact_blocked:
            self.log_result("Rate Limiting", "PASS", "Contact form rate limiting is working")
        else:
            self.log_result("Rate Limiting", "WARNING", "Contact form rate limiting not triggered (may need more requests)")
    
    def test_security_headers(self):
        """Test security headers"""
        print("\n🔍 Testing Security Headers...")
        
        try:
            response = self.session.get(self.base_url, timeout=5)
            headers = response.headers
            
            required_headers = {
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': ['DENY', 'SAMEORIGIN'],
                'X-XSS-Protection': '1; mode=block',
                'Strict-Transport-Security': None,  # Should exist
                'Content-Security-Policy': None,  # Should exist
                'Referrer-Policy': None  # Should exist
            }
            
            missing_headers = []
            weak_headers = []
            
            for header, expected_value in required_headers.items():
                if header not in headers:
                    missing_headers.append(header)
                elif expected_value is not None:
                    if isinstance(expected_value, list):
                        if headers[header] not in expected_value:
                            weak_headers.append(f"{header}: {headers[header]}")
                    elif headers[header] != expected_value:
                        weak_headers.append(f"{header}: {headers[header]}")
            
            if missing_headers:
                self.log_result("Security Headers", "FAIL", f"Missing headers: {', '.join(missing_headers)}")
            elif weak_headers:
                self.log_result("Security Headers", "WARNING", f"Weak headers: {', '.join(weak_headers)}")
            else:
                self.log_result("Security Headers", "PASS", "All security headers present")
        
        except requests.RequestException as e:
            self.log_result("Security Headers", "FAIL", f"Could not test headers: {str(e)}")
    
    def test_https_redirect(self):
        """Test HTTPS redirect (if applicable)"""
        print("\n🔍 Testing HTTPS Redirect...")
        
        if self.base_url.startswith('https://'):
            http_url = self.base_url.replace('https://', 'http://')
            try:
                response = self.session.get(http_url, allow_redirects=False, timeout=5)
                if response.status_code in [301, 302, 307, 308]:
                    location = response.headers.get('Location', '')
                    if location.startswith('https://'):
                        self.log_result("HTTPS Redirect", "PASS", "HTTP to HTTPS redirect working")
                    else:
                        self.log_result("HTTPS Redirect", "FAIL", "Redirect not to HTTPS")
                else:
                    self.log_result("HTTPS Redirect", "FAIL", "No HTTPS redirect found")
            except requests.RequestException:
                self.log_result("HTTPS Redirect", "WARNING", "Could not test HTTPS redirect")
        else:
            self.log_result("HTTPS Redirect", "WARNING", "Testing HTTP endpoint - HTTPS redirect not applicable")
    
    def test_admin_access_control(self):
        """Test admin access control"""
        print("\n🔍 Testing Admin Access Control...")
        
        admin_endpoints = [
            '/admin',
            '/admin/dashboard',
            '/admin/contacts',
            '/admin/projects',
            '/admin/blog'
        ]
        
        unauthorized_access = []
        
        for endpoint in admin_endpoints:
            try:
                response = self.session.get(urljoin(self.base_url, endpoint), timeout=5)
                
                # Should redirect to login or return 403
                if response.status_code == 200:
                    # Check if it's actually the login page
                    if 'login' not in response.text.lower():
                        unauthorized_access.append(endpoint)
                elif response.status_code not in [302, 403, 401]:
                    unauthorized_access.append(f"{endpoint} (status: {response.status_code})")
            
            except requests.RequestException as e:
                self.log_result("Admin Access Control", "WARNING", f"Request to {endpoint} failed: {str(e)}")
        
        if unauthorized_access:
            self.log_result("Admin Access Control", "FAIL", f"Unauthorized access to: {', '.join(unauthorized_access)}")
        else:
            self.log_result("Admin Access Control", "PASS", "Admin endpoints properly protected")
    
    def test_csrf_protection(self):
        """Test CSRF protection"""
        print("\n🔍 Testing CSRF Protection...")
        
        # Try to submit forms without CSRF token
        csrf_vulnerable = []
        
        # Test contact form
        try:
            response = self.session.post(urljoin(self.base_url, '/contact'), data={
                'name': 'Test User',
                'email': 'test@test.com',
                'subject': 'Test',
                'message': 'Test message'
                # No CSRF token
            }, timeout=5)
            
            if response.status_code == 200 and 'success' in response.text.lower():
                csrf_vulnerable.append('/contact')
        
        except requests.RequestException as e:
            self.log_result("CSRF Protection", "WARNING", f"Contact form test failed: {str(e)}")
        
        # Test login form
        try:
            response = self.session.post(urljoin(self.base_url, '/admin/login'), data={
                'username': 'admin',
                'password': 'password'
                # No CSRF token
            }, timeout=5)
            
            if response.status_code == 200 and 'success' in response.text.lower():
                csrf_vulnerable.append('/admin/login')
        
        except requests.RequestException as e:
            self.log_result("CSRF Protection", "WARNING", f"Login form test failed: {str(e)}")
        
        if csrf_vulnerable:
            self.log_result("CSRF Protection", "FAIL", f"CSRF vulnerable endpoints: {', '.join(csrf_vulnerable)}")
        else:
            self.log_result("CSRF Protection", "PASS", "CSRF protection appears to be working")
    
    def test_information_disclosure(self):
        """Test for information disclosure"""
        print("\n🔍 Testing Information Disclosure...")
        
        sensitive_files = [
            '/.env',
            '/config.py',
            '/app.py',
            '/.git/config',
            '/backup.sql',
            '/database.db',
            '/admin.py',
            '/requirements.txt'
        ]
        
        disclosed_files = []
        
        for file_path in sensitive_files:
            try:
                response = self.session.get(urljoin(self.base_url, file_path), timeout=5)
                
                if response.status_code == 200:
                    # Check if it's actually file content (not a 404 page)
                    if len(response.text) > 100 and 'not found' not in response.text.lower():
                        disclosed_files.append(file_path)
            
            except requests.RequestException:
                pass  # Expected for most files
        
        if disclosed_files:
            self.log_result("Information Disclosure", "FAIL", f"Sensitive files accessible: {', '.join(disclosed_files)}")
        else:
            self.log_result("Information Disclosure", "PASS", "No sensitive files disclosed")
    
    def run_all_tests(self):
        """Run all security tests"""
        print("🛡️  Starting Security Test Suite")
        print("=" * 50)
        
        start_time = time.time()
        
        # Run tests
        self.test_security_headers()
        self.test_https_redirect()
        self.test_admin_access_control()
        self.test_csrf_protection()
        self.test_sql_injection()
        self.test_xss_protection()
        self.test_rate_limiting()
        self.test_information_disclosure()
        
        end_time = time.time()
        
        # Summary
        print("\n" + "=" * 50)
        print("🔍 Security Test Summary")
        print("=" * 50)
        
        passed = len([r for r in self.results if r['status'] == 'PASS'])
        failed = len([r for r in self.results if r['status'] == 'FAIL'])
        warnings = len([r for r in self.results if r['status'] == 'WARNING'])
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️  Warnings: {warnings}")
        print(f"⏱️  Total time: {end_time - start_time:.2f} seconds")
        
        if failed > 0:
            print("\n❌ CRITICAL: Security vulnerabilities detected!")
            print("Please review and fix the failed tests before deployment.")
            return False
        elif warnings > 0:
            print("\n⚠️  WARNING: Some security checks need attention.")
            print("Review the warnings and consider implementing additional security measures.")
            return True
        else:
            print("\n✅ SUCCESS: All security tests passed!")
            return True
    
    def save_report(self, filename="security_test_report.json"):
        """Save test results to file"""
        with open(filename, 'w') as f:
            json.dump({
                'timestamp': time.time(),
                'base_url': self.base_url,
                'results': self.results
            }, f, indent=2)
        print(f"📄 Report saved to {filename}")

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Security Testing Suite')
    parser.add_argument('--url', default='http://localhost:5000', 
                       help='Base URL to test (default: http://localhost:5000)')
    parser.add_argument('--report', default='security_test_report.json',
                       help='Report filename (default: security_test_report.json)')
    
    args = parser.parse_args()
    
    tester = SecurityTester(args.url)
    success = tester.run_all_tests()
    tester.save_report(args.report)
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()