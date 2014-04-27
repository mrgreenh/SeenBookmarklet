(function(){
    //Settings and expansions
    this.seenEndpoint = "http://yair-api.mahaya.co/v0.1/create/";
    this.baseUrl = "http://stage.mahaya.co/",
    this.apiKey = '1234';

    this.scrapers = {
        'testPage': {
            title: function(){
                return document.querySelector('h1').innerHTML;
            },
            start_time: function(){
                var d = new Date(parseInt(document.querySelector('.startTime').innerHTML));
		return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+"T"+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
            },
            end_time: function(){
                var d = new Date(parseInt(document.querySelector('.endTime').innerHTML));
		return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+"T"+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
            },
            location: function(){
                return 'New York, NY';
            },
	    tz: function(){
		return $("#seenBookmarkletContainer #timezoneSelector").val();
	    },
            hashtags: function(){
		var input = $("#seenBookmarkletContainer #hashtagsField").val();
                var hashtags = input.split(' ');
                return hashtags;
            }
        }
    }

    this.interfaceFields = {
	'testPage': ["tz", "hashtags"],
    }

    this.websites = [
        {
            regex: /localhost/i,
            name: 'testPage'
        }
    ]


    //Checking for jquery
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

    this.init = function(){
	this.$body = $("body");
        var website = this.detectWebsite();
	this.insertInterfaceContainer(website);
	this.$interface.find("#createEventButton").click($.proxy(this, "scrapePage"));
    }

    this.model = {
        title: '',
        hashtags: [],
        start_time: null,
        end_time: null,
	tz: "-5.0",
	location:'',
    }

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
	$.post(endpointWithHashtags, this.model).done($.proxy(function(data){
	    data = JSON.parse(data);
	    if(data.status=="OK"){
		this.displaySuccessMessage(data.data);
	    }else{
		var message = data.type;
		this.displayMessage(message,true);
	    }
	}, this));
    }

    this.scrapePage = function(){
        var website = this.detectWebsite();
	if(!website) return;
        for(key in this.model){
            this.model[key] = this.scrapers[website][key]();
        }
        this.sendData();
    }

    //--------------------View methods
    this.insertInterfaceContainer = function(website){
	var $bookmarkletInterface = $("<div id='seenBookmarkletContainer'><div id='seenBookmarkletContent'></div>")
	this.$interface = $bookmarkletInterface.find("#seenBookmarkletContent").first();
	this.$interface.append(this.renderMessage("Please fill in missing data:"));
	var requiredFields = this.interfaceFields[website];
	if(requiredFields.length){
	    var $fields = $("<ul></ul>");
	    for(i in requiredFields){
		$fields.append(this[requiredFields[i]+"Field"]());
	    }
	    this.$interface.append($fields);
	    this.$interface.append("<a href='#' id='createEventButton'>Create Event</a>");
	}
	this.$body.append($bookmarkletInterface);
    }

    this.renderMessage = function(message,error){
	var $messageContainer = $("<div id='bookmarkletMessages'></div>");
	if(error) $messageContainer.addClass("error");
	$messageContainer.text(message);
	return $messageContainer;
    }

    this.displayMessage = function(message,error){
	var $messageContainer = this.renderMessage(message,error);
	this.$interface.empty().append($messageContainer);
    }

    this.displaySuccessMessage = function(data){
	var message = "A new event '"+data.title+"' was created:"
	this.$interface.empty().append(this.renderMessage(message));
	var $viewLink = $("<li><a href='"+this.baseUrl+"event/"+data.locator+"'>View event</a></li>");
	var $editLink = $("<li><a href='"+this.baseUrl+"event/"+data.locator+"/edit_details'>Edit event</a></li>");
	var $linksList = $("<ul></ul>");
	$linksList.append($viewLink).append($editLink);
	this.$interface.append($linksList);
    }

    //--------------------Fields rendering
    
    this.tzField = function(){
	var $select = $("<select name='timezoneSelector' id='timezoneSelector'></select>");
	for(option in this.timezoneOptions){
	    var $option = $("<option value='"+option+"'>"+this.timezoneOptions[option]+"</option>");
	    $select.append($option);
	}
	var $container = $("<li><label for='timezoneSelector'>Select a timezone:</label></li>");
	$container.append($select);
	return $container;
    }

    this.hashtagsField = function(){
	var $input = $("<input name='hashtagsField' id='hashtagsField'></select>");
	var $container = $("<li><label for='hashtagsField'>Space-separated hashtags (without #):</label></li>");
	$container.append($input);
	var $searchLink = $("<a href='#'>Search on Twitter</a>");
	$searchLink.on('click', function(){
	   window.open("https://twitter.com/search?q="+encodeURI($("#seenBookmarkletContainer #hashtagsField").val()));
	});
	$container.append($searchLink);
	return $container;
    }

    this.timezoneOptions = {
	"0.0": "(GMT) Western Europe Time, London, Lisbon, Casablanca",
	"1.0": "(GMT +1:00 hour) Brussels, Copenhagen, Madrid, Paris",
	"2.0": "(GMT +2:00) Kaliningrad, South Africa",
	"3.0": "(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg",
	"3.5": "(GMT +3:30) Tehran",
	"4.0": "(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi",
	"4.5": "(GMT +4:30) Kabul",
	"5.0": "(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent",
	"5.5": "(GMT +5:30) Bombay, Calcutta, Madras, New Delhi",
	"5.75": "(GMT +5:45) Kathmandu",
	"6.0": "(GMT +6:00) Almaty, Dhaka, Colombo",
	"7.0": "(GMT +7:00) Bangkok, Hanoi, Jakarta",
	"8.0": "(GMT +8:00) Beijing, Perth, Singapore, Hong Kong",
	"9.0": "(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk",
	"9.5": "(GMT +9:30) Adelaide, Darwin",
	"10.0": "(GMT +10:00) Eastern Australia, Guam, Vladivostok",
	"11.0": "(GMT +11:00) Magadan, Solomon Islands, New Caledonia",
	"12.0": "(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka",
	"-1.0": "(GMT -1:00 hour) Azores, Cape Verde Islands",
	"-2.0": "(GMT -2:00) Mid-Atlantic",
	"-3.0": "(GMT -3:00) Brazil, Buenos Aires, Georgetown",
	"-3.5": "(GMT -3:30) Newfoundland",
	"-4.0": "(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz",
	"-5.0": "(GMT -5:00) Eastern Time (US & Canada), Bogota, Lima",
	"-6.0": "(GMT -6:00) Central Time (US & Canada), Mexico City",
	"-7.0": "(GMT -7:00) Mountain Time (US & Canada)",
	"-8.0": "(GMT -8:00) Pacific Time (US & Canada)",
	"-9.0": "(GMT -9:00) Alaska",
	"-10.0": "(GMT -10:00) Hawaii",
	"-11.0": "(GMT -11:00) Midway Island, Samoa",
	"-12.0": "(GMT -12:00) Eniwetok, Kwajalein",
    }

    this.init();
    console.log(this.model);
})();
