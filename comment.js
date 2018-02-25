function getUrl(callback) {
  var request = {currentWindow: true, active: true};

  chrome.tabs.query(request, (result) => {
    var tab = result[0];
    var current_url = tab.url;
    callback(current_url);
  });
}

function addComment(){
	console.log("addComment start")
	getUrl((url)=>{
	  var new_comment = document.getElementById('comment_text').value;
	  getCurrentComments(url, (current_comments) => {
		  if (current_comments === undefined || current_comments.length == 0){
		  	current_comments = [new_comment];
		  }
		  else{
		  	current_comments.push(new_comment);
		  }
		  var items = {};
		  items[url] = current_comments;
		  chrome.storage.sync.set(items)
		  document.getElementById("new_comment").textContent= new_comment;
		});
	});  
}

function getCurrentComments(url, callback){
	chrome.storage.sync.get(url, (comments) => {
		callback(chrome.runtime.lastError ? null : comments[url])
	});
}

/**
function getSavedBackgroundColor(url, callback) {
  chrome.storage.sync.get(url, (items) => {
    callback(chrome.runtime.lastError ? null : items[url]);
  });
}

function saveBackgroundColor(url, color) {
  var items = {};
  items[url] = color;

  chrome.storage.sync.set(items);
}**/