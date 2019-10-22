//variables to store name of S3 bucket, the region and the Identity Pool ID
var folderBucketName = 'jobpositions';
var bucketRegion = 'US-EAST-1';
var IdentityPoolId = 'us-east-1:100dd32c-a6df-4f10-b90c-138c108feb57';
var newVar;
var mtdt;
//config is updated
AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
   IdentityPoolId: IdentityPoolId
  })
});
//new S3 bucket instance is created
var s3 = new AWS.S3({
  params: {Bucket: folderBucketName}
});
var queryString = decodeURIComponent(window.location.search);
queryString = queryString.substring(1);
var queries = queryString.split("&");
//function used to list all the job positions
function listJobPositions() {
	//call the S3 listObjects method
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
            '</span> &nbsp',
			'<button onclick="deleteFolder(\'' + folderName + '\')">Delete Folder</button>',
			'<br/><br/>',
          
        ]);
      });
      var message = folders.length ?
        getHtml([
          '<p>Click on the folder name to view the resumes for the Job Position to view it.</p>',
          '<p>Create a new folder for any new Job Positions. Please name the folder with the name of the Job Position</p>'
        ]) :
        '<p>You do not have any Job Postion folders.<br/> Please create a folder for a Job Position.<br/> Please name the folder with the name of the Job Position';
      var htmlTemplate = [
        '<h2>Folders</h2>',
        message,
        '<ul>',
          getHtml(folders),
        '</ul>',
        '<button onclick="createFolder(prompt(\'Enter Folder (Job Position) Name:\'))">',
          'Create New Folder',
        '</button>'
      ]
      document.getElementById('app').innerHTML = getHtml(htmlTemplate);
    }
  });
}

//function to create a new Job Position folder
function createFolder(folderName) {
  folderName = folderName.trim();
  //validations on the folder name
  if (!folderName) {
    return alert('Folder names must contain at least one non-space character.');
  }
  if (folderName.indexOf('/') !== -1) {
    return alert('Folder names cannot contain slashes.');
  }
  var albumKey = encodeURIComponent(folderName) + '/';
  s3.headObject({Key: albumKey}, function(err, data) {
    if (!err) {
      return alert('Folder already exists.');
    }
    if (err.code !== 'NotFound') {
      return alert('There was an error creating your folder: ' + err.message);
    }
	//call S3 putObject method to create a folder
    s3.putObject({Key: albumKey}, function(err, data) {
      if (err) {
        return alert('There was an error creating your folder: ' + err.message);
      }
      alert('Successfully created new folder.');
	  //If folder was created successfully,call the view function to view resumes in the folder
      viewFolder(folderName);
    });
  });
}
//function to view contents of a folder
function viewFolder(folderName) {
	document.getElementById("app").style.display = "block";

  var folderKey = encodeURIComponent(folderName) + '/';
  
  //s3.listObjects to list folder contents
  s3.listObjects({Prefix: folderKey}, function(err, data) {
    if (err) {
      return alert('There was an error viewing your folder: ' + err.message);
    }
    // 'this' references the AWS.Response instance that represents the response
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + folderBucketName + '/';

    var resumes = data.Contents.map(function(res) {
	
      var fileKey = res.Key;
	  var newStr = fileKey[fileKey.length-1];
	  //Added this condition to only display resumes and not folder names
	  if(newStr != '/'){
		var fname1;  	
      var fileURL = bucketUrl + encodeURIComponent(fileKey);
	  newVar = fileURL;
	  var str = fileKey.replace(folderKey,'');
      return getHtml([
        '<span>',
		'<li>',
		'<span onclick="viewFileDetails(\'' + fileKey + '\')" style=" color:blue;text-decoration:underline; 	cursor:pointer;">',
        fileKey.replace(folderKey, ''),
		'</span>',
			   ' - <a href ="'+ newVar +'"> Download Link</a>',
			   '<input type="button" value="Delete Resume" onclick="deleteFile(\'' + folderName + "','" + fileKey + '\')">',
         '<div>',
		 '</span>',
      ]);
	  }});
    var message = resumes.length >1 ?
      '<p>Click on the Resume Name to view more details of the file.<br/>Below are the resumes for this Job Position:</p>' :
      '<p>No resumes</p>';
    var htmlTemplate = [
      '<h2>',
        'Job Position: ' + folderName,
      '</h2>',
      message,
      '<div>',
	  
        getHtml(resumes),
      '</div>',
	   '<button onclick="listJobPositions()">',
        'Back To Folders',
      '</button>'
     
    ]
	if( document.getElementById('app1') != null) {
	document.getElementById("app1").style.display = "none";
	}
    document.getElementById('app').innerHTML = getHtml(htmlTemplate);
	if( document.getElementById('heading') != null) {
	 document.getElementById('heading').innerHTML = '';
	}
  });
}
//To view details of selected file
function viewFileDetails(file){
		 location.href="fileDetails.html?param1="+file;
}

//Function to get the details of the file
function fileMetadataFetch(fileKey) {
	var res = fileKey.split('/');
	var folderName = res[0];
	var folderKey = encodeURIComponent(folderName) + '/';
	var fin = folderKey + res[1];
	var filKey = encodeURIComponent(res[1]);
	var names = res[1].replace('.docx','');
	var splitNames = names.split(' ');
	var params = {
  Bucket: folderBucketName, 
  Key: fin
 };
 //get the filde details using s3.headObject method
 s3.headObject(params, function(err, data) {
   if (err) console.log(err); // an error occurred
   else     console.log(JSON.stringify(data));   
   var htmlTemplate = [
	'<table border="1">',
	'<tr>',
	'<th>File Name</th>',
	'<th>Candidate First Name</th>',
	'<th>Candidate Last Name</th>',
	'<th>Job Position</th>',
	'<th>File Size</th>',
	'<th>Last Modified Time</th>',
	'</tr>',
	'<tr>',
	'<td>'+res[1]+'</td>',
	'<td>'+splitNames[0]+'</td>',
	'<td>'+splitNames[1]+'</td>',
	'<td>'+folderName+'</td>',
	'<td>'+JSON.stringify(data.ContentLength)+'</td>',
	'<td>'+JSON.stringify(data.LastModified).replace(/\"/g, "")+'</td>',
	'</tr>',
	'<table>',
	'<br/>',
	'<input type="button" value="Back to Folder" onclick="viewFolder(\'' + folderName+'\')">',
   ]
    document.getElementById("app").style.display = "none";
       document.getElementById('app1').innerHTML = getHtml(htmlTemplate);
	 
   
   
 });
}

//function to delete a file
function deleteFile(folderName, fileKey) {
	//s3 deleteObject method is used for deletion
  s3.deleteObject({Key: fileKey}, function(err, data) {
    if (err) {
      return alert('There was an error deleting your file: ', err.message);
    }
    alert('Successfully deleted Resume.');
    viewFolder(folderName);
  });
}

//function to delete the whole Job Position Folder
function deleteFolder(folderName) {
  var folderKey = encodeURIComponent(folderName) + "/";
  s3.listObjects({ Prefix: folderKey }, function(err, data) {
    if (err) {
      return alert("There was an error deleting your folder: ", err.message);
    }
    var objects = data.Contents.map(function(object) {
      return { Key: object.Key };
    });
	//s3 deleteObjects is used to delete the folder and its contents
    s3.deleteObjects(
      {
        Delete: { Objects: objects, Quiet: true }
      },
      function(err, data) {
        if (err) {
          return alert("There was an error deleting your folder: ", err.message);
        }
        alert("Successfully deleted folder.");
        listJobPositions();
      }
    );
  });
}
