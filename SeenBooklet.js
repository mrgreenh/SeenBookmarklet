(function(){
    this.seenEndpoint = "http://api.seen.co/v0.1/create/",
    this.apiKey = '8967858593';

    this.model = {
        title: '',
        hashtags: [],
        start_time: null,
        end_time: null,
	location:'',
    }

    this.scrapers = {
        'testPage': {
            title: function(){
                return document.querySelector('h1').innerHTML;
            },
            start_time: function(){
                return new Date(parseInt(document.querySelector('.startTime').innerHTML));
            },
            end_time: function(){
                return new Date(parseInt(document.querySelector('.endTime').innerHTML));
            },
            location: function(){
                return 'New York, NY';
            },
            hashtags: function(){
                var input = prompt("Enter space separated list of hashtags, without #s");
                var hashtags = input.split(' ');
                return hashtags;
            }
        }
    }

    this.websites = [
        {
            regex: /SeenBooklet/i,
            name: 'testPage'
        }
    ]

    this.detectWebsite = function(){
        var currentAddress = window.location;
        for(i in this.websites){
            var website = this.websites[i];
            if(website.regex.test(currentAddress)){
                return website.name;
            }
        }
        alert('This website is not recognized yet by Seen\'s bookmarklet.');
	return false;
    }

    this.sendData = function(){
        var endpointWithHashtags = seenEndpoint;
        for(i in this.model.hashtags){
            endpointWithHashtags += this.model.hashtags[i];
            if(!(i==this.model.hashtags.length-1)) endpointWithHashtags+='%20';
        }
        var postData = new FormData();
        postData.append('api_key',this.apiKey);
        for(k in this.model){
            if(!(k=='hashtags')){
                postData.append(k,this.model[k]);
            }
        }
        var request = new XMLHttpRequest();
        request.open("POST",this.seenEndpoint,false);
        request.send(postData);
        console.log(request.responseText);
    }

    this.scrapePage = function(){
        var website = this.detectWebsite();
	if(!website) return;
        for(key in this.model){
            this.model[key] = this.scrapers[website][key]();
        }
        this.sendData();
    }

    this.scrapePage();
    console.log(this.model);
})();
