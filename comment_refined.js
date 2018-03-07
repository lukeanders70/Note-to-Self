
var already_deleted = [];

function getUrl(callback) {
    var request = {currentWindow: true, active: true};

    chrome.tabs.query(request, (result) => {
        var tab = result[0];
        var current_url = tab.url;
        getDomain(current_url, (domain) => {
            callback(current_url, domain);
        });
    });
}

function getDomain(url, callback) {
    console.log(url.split("://")[1].split("/")[0]);
    callback(url.split("://")[1].split("/")[0]);
}

function getCurrentComments(url, domain, callback){
    chrome.storage.sync.get([url, domain], (comments) => {
        callback(chrome.runtime.lastError ? null : [comments[domain], comments[domain][url]])
    });
}

function loadCurrentComments(url, domain){
    getCurrentComments(url, domain, (all_comments) => {
        current_comments = all_comments[0];
        current_comments_domain = all_comments[1];
        var comment;

        document.getElementById("current_comments").innerHTML = "";

        for (i = 0; i < current_comments.length; i++){
            new_div = document.createElement('div');
            new_div.setAttribute("id", "comment_block_" + i);
            new_div.setAttribute("class", "comment_block");

            new_span = document.createElement('span');
            new_span.setAttribute("class", "comment_text");

            new_button = document.createElement('button');
            new_button.setAttribute("id", "delete_comment_" + i);
            new_button.setAttribute("class", "delete_button");
            new_button.setAttribute("title", "delete comment");

            new_text = document.createTextNode(current_comments[i]);
            x_text = document.createTextNode("x")

            new_span.appendChild(new_text);
            new_button.appendChild(x_text)
            new_div.appendChild(new_span);
            new_div.appendChild(new_button);

            document.getElementById("current_comments").appendChild(new_div);
        }

        document.getElementById("current_comments_domain").innerHTML = "";

        for (i = 0; i < current_comments_domain.length; i++){
            new_div = document.createElement('div');
            new_div.setAttribute("id", "domain_comment_block_" + i);
            new_div.setAttribute("class", "comment_block");

            new_span = document.createElement('span');
            new_span.setAttribute("class", "comment_text");

            new_button = document.createElement('button');
            new_button.setAttribute("id", "delete_domain_comment_" + i);
            new_button.setAttribute("class", "delete_button");
            new_button.setAttribute("title", "delete comment");

            new_text = document.createTextNode(current_comments_domain[i]);
            x_text = document.createTextNode("x")

            new_span.appendChild(new_text);
            new_button.appendChild(x_text)
            new_div.appendChild(new_span);
            new_div.appendChild(new_button);

            document.getElementById("current_comments_domain").appendChild(new_div);
        }
    });
}

function deleteCommentFunction(i, current_comments, url, callback){
    var delete_i = function(){
        document.getElementById("comment_block_" + i.toString()).remove();
        offset = 0;
        for(j = 0; j < already_deleted.length; j++){
            if(already_deleted[j] < i){
                offset += 1;
            }
        }
        current_comments.splice(i - offset, 1);
        var comments_for_storage = {};
        comments_for_storage[url] = current_comments;
        chrome.storage.sync.set(comments_for_storage);
        already_deleted.push(i);
    }
    callback(delete_i)
}

document.addEventListener('DOMContentLoaded', () => {
    getUrl((url, domain)=>{

        loadCurrentComments(url, domain);

        getCurrentComments(url, domain, (all_comments) => {
            old_domain_comments = all_comments[0]
            current_comments = all_comments[1]
            document.getElementById("comment_button").addEventListener("click", function(){
                var new_comment = document.getElementById('comment_text').value;

                if (current_comments == undefined || current_comments.length == 0){
                    current_comments = [new_comment];
                }
                else{
                    current_comments.push(new_comment);
                }

                //store comments for this URL as list in local memory
                var comments_for_storage = {};
                comments_for_storage[domain] = old_domain_comments;
                comments_for_storage[domain][url] = current_comments;
                chrome.storage.sync.set(comments_for_storage);


            for (i = 0; i < current_comments.length; i++){
                //setting listeners for delete buttons
                deleteCommentFunction(i, current_comments, url, (deleteFunction) => {
                    document.getElementById("delete_comment_" + i.toString()).addEventListener("click", deleteFunction);
                    document.getElementById('comment_text').value = "";
                });
            }

            document.getElementById("url_comments_tab_button").addEventListener("click", function(){
                document.getElementById("url_comments_tab").style.display = 'block';
                document.getElementById("domain_comments_tab").style.display = 'none';
            });

            document.getElementById("domain_comments_tab_button").addEventListener("click", function(){
                document.getElementById("url_comments_tab").style.display = 'none';
                document.getElementById("domain_comments_tab").style.display = 'block';
            });
        });
    });
});



// Page Loaded
     // Get Current comments
        // Display comments and set listeners for comments
        // Add New Comment listener
            // Add Comment to database
                //Display comments and set listener for comments