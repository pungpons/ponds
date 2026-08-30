// Google Apps Script (GAS) Backend for PONDs
// Instructions:
// 1. Go to https://script.google.com/ and create a new project.
// 2. Click on "Project Settings" (gear icon) and check "Show 'appsscript.json' manifest file in editor".
// 3. Go back to Editor, open `appsscript.json` and replace its content with the contents of `appsscript.json` from this project.
// 4. Paste the code below into Code.gs (replace everything).
// 5. Click Deploy > New Deployment.
// 6. Select type: "Web App".
// 7. Execute as: "Me" (Your Google Account).
// 8. Who has access: "Anyone".
// 9. Click Deploy, authorize the permissions (it will warn about safety, go to Advanced -> Continue), and copy the Web App URL.

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const targetUrl = payload.url;
    const method = payload.method || 'GET';
    const body = payload.body; 
    const headers = payload.headers || {};

    const token = ScriptApp.getOAuthToken();
    const options = {
      method: method,
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': headers['Content-Type'] || 'application/json'
      },
      muteHttpExceptions: true
    };
    
    if (body) {
      options.payload = (typeof body === 'string') ? body : JSON.stringify(body);
    }

    const response = UrlFetchApp.fetch(targetUrl, options);
    
    const headersStr = JSON.stringify(response.getAllHeaders() || {}).toLowerCase();
    let bodyData = "";
    if (headersStr.includes('image/') || headersStr.includes('application/pdf')) {
      bodyData = Utilities.base64Encode(response.getBlob().getBytes());
      // Prepend a flag so the frontend knows it's base64 encoded binary
      bodyData = "__BASE64__" + bodyData;
    } else {
      bodyData = response.getContentText();
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: response.getResponseCode(),
      headers: response.getAllHeaders(),
      body: bodyData
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT);
}
