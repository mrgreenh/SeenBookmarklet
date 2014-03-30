(function(){
    this.seenEndpoint = "http://api.seen.co/v0.1/create/",
    this.apiKey = '8967858593';

    this.includeDependencies = function(){
	if(window.jQuery===undefined){
	    console.log('Including jQUery');
	    var script = document.createElement('script');
	    script.setAttribute('src',"http://code.jquery.com/jquery-2.1.0.min.js");
	    script.setAttribute('type','text/javascript');
	    document.querySelector('head').appendChild(script);
	    return false;
	}
	return true;
    }

    if(!this.includeDependencies()){
	alert('Jquery was not included, but we just added it to the page. Run the Seen Scraper again.');
	return;
    }

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
            regex: /localhost/i,
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
	this.model.api_key = this.apiKey;
	delete this.model.hashtags;
	$.post(endpointWithHashtags, this.model).done(function(data){
	    console.log(data);
	});
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
