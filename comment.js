function getUrl(callback) {
  var request = {currentWindow: true, active: true};

  chrome.tabs.query(request, (result) => {
    var tab = result[0];
    var current_url = tab.url;
    callback(current_url);
  });
}

function getCurrentComments(url, callback){
	chrome.storage.sync.get(url, (comments) => {
		callback(chrome.runtime.lastError ? null : comments[url])
	});
}

function loadCurrentComments(url){
	getCurrentComments(url, (current_comments) => {
		var comment;
		console.log(current_comments)
		for (i = 0; i < current_comments.length; i++){
			document.getElementById("current_comments").innerHTML = document.getElementById("current_comments").innerHTML + "<br>" + current_comments[i];
		}
	});
}

document.addEventListener('DOMContentLoaded', () => {
	getUrl((url)=>{
		document.getElementById("comment_button").addEventListener("click", function(){
		  getCurrentComments(url, (current_comments) => {
		  	console.log(current_comments)
			  var new_comment = document.getElementById('comment_text').value;

			  if (current_comments === undefined || current_comments.length == 0){
			  	current_comments = [new_comment];
			  }
			  else{
			  	current_comments.push(new_comment);
			  }

			  //store comments for this URL as list in local memory
			  var comments_for_storage = {};
			  comments_for_storage[url] = current_comments;
			  chrome.storage.sync.set(comments_for_storage)

			  //add the newest comment to the display and remove text from input box (not done automatically because this is not a submit button)
			  document.getElementById("current_comments").innerHTML = document.getElementById("current_comments").innerHTML + "<br>" + new_comment;
			  document.getElementById('comment_text').value = "";
			});
		});

		loadCurrentComments(url);

	});
});

