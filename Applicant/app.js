//set the bucket name, region and Identity pool ID
var folderBucketName = 'jobpositions';
var bucketRegion = 'US-EAST-1';
var IdentityPoolId = 'us-east-1:100dd32c-a6df-4f10-b90c-138c108feb57';
var firstName;
var lastName;
//update config
AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
   IdentityPoolId: IdentityPoolId
  })
});

var s3 = new AWS.S3({
  params: {Bucket: folderBucketName}
});
var queryString = decodeURIComponent(window.location.search);
queryString = queryString.substring(1);
var queries = queryString.split("&");

//list all available job positions
function listJobPositions() {
  s3.listObjects({Delimiter: '/'}, function(err, data) {
    if (err) {
      return alert('There was an error listing your job positions: ' + err.message);
    } else {
      var folders = data.CommonPrefixes.map(function(commonPrefix) {
        var prefix = commonPrefix.Prefix;
        var folderName = decodeURIComponent(prefix.replace('/', ''));
        return getHtml([
          
			
            '<span onclick="viewFolder(\'' + folderName + '\')" style=" color:blue;text-decoration:underline; 	cursor:pointer;">',
              folderName,
            '</span>',
			'<br/>'
          
        ]);
      });
      var message = folders.length ?
        getHtml([
          '<p>Click on any Job Position to upload your resume.</p>'
         
        ]) :
        '<p>You do not have any Job Postion folders.<br/> Please create a folder for a Job Position.<br/> Please name the folder with the name of the Job Position';
      var htmlTemplate = [
        '<h2>Job Positions</h2>',
        message,
        '<ul>',
          getHtml(folders),
        '</ul>'
      ]
      document.getElementById('app').innerHTML = getHtml(htmlTemplate);
    }
  });
}


//view a folder to upload your resume
function viewFolder(folderName) {
	var resumeUploaded;
	var urlParams = new URLSearchParams(window.location.search);
	var url = window.location.href;
	var res = url.split("=");
	var final = res[2].replace("&expires_in","");
	
AWS.config.update({
  region: 'us-east-1'
});
	var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
        var params = {
  AccessToken: final /* required */
};
cognitoidentityserviceprovider.getUser(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else    {
     
     firstName = data.UserAttributes[2].Value;
	 lastName = data.UserAttributes[3].Value;
  }
});  
	 
	
	
  var folderKey = encodeURIComponent(folderName) + '/';
  s3.listObjects({Prefix: folderKey}, function(err, data) {
	 
    if (err) {
      return alert('There was an error viewing your folder: ' + err.message);
    }
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + folderBucketName + '/';
	var resumes = data.Contents.map(function(res){
		//check if user has uploaded resume, and if he has, then display it
		 var fileKey = res.Key;
		
		 var filName = fileKey.replace(folderKey, '');
		 if(filName != '')
		 {
			
			if(filName.includes(firstName+' '+lastName)){
				resumeUploaded = true;
				  var newStr = fileKey[fileKey.length-1];
	 
	  if(newStr != '/'){
      var fileURL = bucketUrl + encodeURIComponent(fileKey);
	  var newVar = fileURL;
	 
      return getHtml([
        '<span>',
          '<span>File Name:',
              fileKey.replace(folderKey, ''),
			   ' - <a href ="'+ newVar +'"> Download Link</a>',
            '</span>',
			'<span onclick="deleteFile(\'' + folderName + "','" + fileKey + '\')" style=" color:blue;text-decoration:underline; 	cursor:pointer;">',
              'Delete Resume',
            '</span>',
		  '<div>',
		 
          '<div>',
            
           
          '</div>',
        '</span>',
      ]);
			}
		 }
	}});

    var message = resumes.length > 1?
      '<p>You have applied for this job! You can download the uploaded resume or delete it. </p>' :
      '<p>You have not applied for this Job yet! Please upload your resume below to apply for this Job.</p>';
	
	//to conditionally display a message based on whether the applicant has uploaded a resume or not.
	 var upload = resumeUploaded == true ? 'To update the resume, please upload the updated file here: <br/><div><input id="fileUpload" type="file" accept=".docx"><button id="addFile" onclick="addFile(\'' + folderName +'\')">Update Resume</button> Note: Please name the uploaded resume with your full name.<br/> <br/><button onclick="listJobPositions()">Back To Folders</button>':'</div><input id="fileUpload" type="file" accept=".docx"><button id="addFile" onclick="addFile(\'' + folderName +'\')">Upload Resume</button> Note: Please name the uploaded resume with your full name.<br/> <br/><button onclick="listJobPositions()">Back To Folders</button>';
	
    var htmlTemplate = [
      '<h2>',
        'Album: ' + folderName,
      '</h2>',
      message,
      '<div>',
        getHtml(resumes),
     upload
    ]
    document.getElementById('app').innerHTML = getHtml(htmlTemplate);
  });
}

//function to upload a resume
function addFile(folderName) {
  var files = document.getElementById('fileUpload').files;
  if (!files.length) {
    return alert('Please choose a file to upload first.');
  }
  var file = files[0];
  var fileName = file.name;
  var folderKey = encodeURIComponent(folderName) + '/';
  var fileKey = folderKey + fileName;
  var urlParams = new URLSearchParams(window.location.search);
  var url = window.location.href;
  var res = url.split("=");
  var final = res[2].replace("&expires_in","");
	s3.upload({
    Key: fileKey,
    Body: file,
	
  }, function(err, data) {
    if (err) {
		
      return alert('There was an error uploading your resume: ', err.message);
    }
	alert('Successfully uploaded resume');
	 
	//storeFileDetails(fileKey);
    viewFolder(folderName);
   
  });
}

//function to delte uploaded resume
function deleteFile(folderName, fileKey) {
  s3.deleteObject({Key: fileKey}, function(err, data) {
    if (err) {
      return alert('There was an error deleting your resume: ', err.message);
    }
    alert('Successfully deleted resume.');
    viewFolder(folderName);
  });
}