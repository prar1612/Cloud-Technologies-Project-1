# Cloud-Technologies-Project-1
This Project is titled -  'Smart Recruiters'. This is an app that can be used by companies, to allow people to apply for jobs by uploading their resumes.
It can also be used by Admins to view all uploaded resumes and also create new Job Positions.

## Files Uploaded Details:
index.html -  The first landing page<br/>
firstpage.html - Admin Login
admin.html - Admin home page with list of folders
app.js - Node JS code to perform operations on S3 bucket
fileDetails.html - Page displaying selected file details
Applicant Folder - Files related to applicant login: index.html - Applicant home page app.js - Node JS code to add/remove resumes 
Lamda Folder -  Lambda function triggered from API Gateway to validate Admin credentials

## How to access the app
You can access the app at 'http://prarthana-aws.com' There are two options available:
1.Log in as Admin
2.Log in as a Job Applicant

## Admin Login
Logging in as a admin, you are redirected to a login page. Admin would be given his credentials, using which he can login. On logging in the admin can view resumes uploaded for created Job Positions, and also create new Job Positions.

## Job Applicant Login
As a job applicant, you would have to sign up for an account, and then login with the newly created credentials.Once logged in, the applicant can click on the interested Job Position and upload their resume.

## AWS Resources used
1.S3 Bucket to store the Job Positions as folders and Resumes as objects within that
2.Cognito - for Job applicant sign up and login
3. DynamoDB - Holds admin credentials
4.API - To create get request to get the admin credentials from DynamoDB
5.Lambda - Triggered by api to get the admin credentials
6. CloudFront - To create a distribution for the webpage hosted on s3
7. R53- Used to create a new domain
8. SNS - Used to send mail to admin whenever new resume is uploaded

