var numResultstoReturn = 50; // the max number of results to return in the SPARQL search query
var numResultsPerPage = 10; // the number of search results per page, for pagination

function setGenusOptions() {
	// create URI-encoded query string
        var string = 'SELECT DISTINCT ?genus WHERE {'
                    +'?identification <http://rs.tdwg.org/dwc/terms/genus> ?genus.'
                    +'}'
                    +'ORDER BY ASC(?genus)';
	var encodedQuery = encodeURIComponent(string);

        // send query to endpoint
        $.ajax({
            type: 'GET',
            url: 'http://rdf.library.vanderbilt.edu/sparql?query=' + encodedQuery,
            headers: {
                Accept: 'application/sparql-results+xml'
            },
            success: parseGenusXml
        });

	}

function setSpeciesOptions(passedGenus) {
	// create URI-encoded query string
	var string = 'SELECT DISTINCT ?species WHERE {'
	            +'?identification <http://rs.tdwg.org/dwc/terms/genus> '+passedGenus+'.'
	            +'?identification <http://rs.tdwg.org/dwc/terms/specificEpithet> ?species.'
	            +'}'
                +'ORDER BY ASC(?species)';
        var encodedQuery = encodeURIComponent(string);

        // send query to endpoint
        $.ajax({
            type: 'GET',
            url: 'http://rdf.library.vanderbilt.edu/sparql?query=' + encodedQuery,
            headers: {
                Accept: 'application/sparql-results+xml'
            },
            success: parseSpeciesXml
        });

	}

function setStateOptions() {
	// create URI-encoded query string
        var string = 'SELECT DISTINCT ?state WHERE {'
                    +'?identification <http://rs.tdwg.org/dwc/terms/stateProvince> ?state.'
                    +'}'
                    +'ORDER BY ASC(?state)';
	var encodedQuery = encodeURIComponent(string);

        // send query to endpoint
        $.ajax({
            type: 'GET',
            url: 'http://rdf.library.vanderbilt.edu/sparql?query=' + encodedQuery,
            headers: {
                Accept: 'application/sparql-results+xml'
            },
            success: parseStateXml
        });

	}

function setCategoryOptions() {
	// create URI-encoded query string
        var string = "PREFIX Iptc4xmpExt: <http://iptc.org/std/Iptc4xmpExt/2008-02-29/>"+
                    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>"+
                    'SELECT DISTINCT ?category WHERE {' +
                    "?image Iptc4xmpExt:CVterm ?view." +
                    "?view rdfs:subClassOf ?featureCategory." +
                    "?featureCategory rdfs:label ?category." +
                    '}'
                    +'ORDER BY ASC(?category)';
	var encodedQuery = encodeURIComponent(string);

        // send query to endpoint
        $.ajax({
            type: 'GET',
            url: 'http://rdf.library.vanderbilt.edu/sparql?query=' + encodedQuery,
            headers: {
                Accept: 'application/sparql-results+xml'
            },
            success: parseCategoryXml
        });

	}

function parseGenusXml(xml) {
    //step through each "result" element
    $(xml).find("result").each(function() {

        // pull the "binding" element that has the name attribute of "state"
        $(this).find("binding[name='genus']").each(function() {
            bindingValue=$(this).find("literal").text();
            quoteBindingValue='"'+bindingValue+'"';
            $("#box1").append("<option value='"+quoteBindingValue+"'>"+bindingValue+'</option>');
        });
    });
}

function parseSpeciesXml(xml) {
    // start the species dropdown over with "Any species" as the first option
    $("#box2 option:gt(0)").remove();
    $("#box2 option").text("Any Species");

    //step through each "result" element
    $(xml).find("result").each(function() {

        // pull the "binding" element that has the name attribute of "species"
        $(this).find("binding[name='species']").each(function() {
            bindingValue=$(this).find("literal").text();
            quoteBindingValue='"'+bindingValue+'"';
            $("#box2").append("<option value='"+quoteBindingValue+"'>"+bindingValue+'</option>');
        });
    });
}

function parseStateXml(xml) {
    //step through each "result" element
    $(xml).find("result").each(function() {

        // pull the "binding" element that has the name attribute of "state"
        $(this).find("binding[name='state']").each(function() {
            bindingValue=$(this).find("literal").text();
            quoteBindingValue='"'+bindingValue+'"';
            $("#box3").append("<option value='"+quoteBindingValue+"'>"+bindingValue+'</option>');
        });
    });
}

function parseCategoryXml(xml) {
    //step through each "result" element
    $(xml).find("result").each(function() {

        // pull the "binding" element that has the name attribute of "state"
        $(this).find("binding[name='category']").each(function() {
            bindingValue=$(this).find("literal").text();
            quoteBindingValue='"'+bindingValue+'"';
            $("#box4").append("<option value='"+quoteBindingValue+"'>"+bindingValue+'</option>');
        });
    });
}


$(document).ready(function(){
    // not searching initially, so hide the spinner icon
    $('#searchSpinner').hide();

	// fires when there is a change in the genus dropdown
	$("#box1").change(function(){
			var genusSelection= $("#box1").val();
			setSpeciesOptions(genusSelection);
	});

	// execute SPARQL query to get genus values and add them to the select options
	setGenusOptions();
	setStateOptions();
	setCategoryOptions();

	// creates a function that's executed when the button is clicked
	$("#searchButton").click(function(){
        // searching, so show the spinner icon
        $('#searchSpinner').show();

        //pulls data from the input boxes
        var genus = $('#box1').val();
        var species = $('#box2').val();
        var state = $('#box3').val();
        var category = $('#box4').val();

        // creates a string that contains the query with the data from the box
        // inserted into the right place
        var query = "PREFIX foaf: <http://xmlns.com/foaf/0.1/>"+
                    "PREFIX ac: <http://rs.tdwg.org/ac/terms/>"+
                    "PREFIX dwc: <http://rs.tdwg.org/dwc/terms/>"+
                    "PREFIX dsw: <http://purl.org/dsw/>"+
                    "PREFIX Iptc4xmpExt: <http://iptc.org/std/Iptc4xmpExt/2008-02-29/>"+
                    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>"+
                    "PREFIX dcterms: <http://purl.org/dc/terms/>"+
                    "SELECT DISTINCT ?uri ?image ?title WHERE {" +
                    "?identification dwc:genus " + genus + "." +
                    "?identification dwc:specificEpithet " + species + "." +
                    "?organism dsw:hasIdentification ?identification." +
                    "?organism foaf:depiction ?image." +
                    "?organism dsw:hasOccurrence ?occurrence." +
                    "?occurrence dsw:atEvent ?event." +
                    "?event dsw:locatedAt ?location." +
                    "?location dwc:stateProvince " + state + "." +
                    "?image Iptc4xmpExt:CVterm ?view." +
                    "?view rdfs:subClassOf ?featureCategory." +
                    "?featureCategory rdfs:label " + category + "." +
                    "?image ac:hasServiceAccessPoint ?sap." +
                    "?sap ac:accessURI ?uri." +
                    "?sap ac:variant ac:Thumbnail." +
                    "?image dcterms:title ?title."+
                    "} " +
                    "LIMIT " + numResultstoReturn;

        // URL-encodes the query so that it can be appended as a query value
        var encoded = encodeURIComponent(query)

        // does the AJAX to send the HTTP GET to the Callimachus SPARQL endpoint
        // then puts the result in the "data" variable
        $.ajax({
            type: 'GET',
            url: 'http://rdf.library.vanderbilt.edu/sparql?query=' + encoded,
            headers: {
                Accept: 'application/sparql-results+xml'
            },
            success: parseXml
        });
    });
});

// converts nodes of an XML object to text. See http://tech.pro/tutorial/877/xml-parsing-with-jquery
// and http://stackoverflow.com/questions/4191386/jquery-how-to-find-an-element-based-on-a-data-attribute-value
function parseXml(xml) {
    // done searching, so hide the spinner icon
    $('#searchSpinner').hide();

    // tell the user how many results we found
    var numResults = $(xml).find("result").length;
    if (numResults < 1) {
        $("#div1").html("<h4 class=\"text-warning\">No bioimages found</h4>");
    }
    else {
        $("#div1").html("<h4 class=\"text-success\">Found "+numResults+" bioimages</h4>");

        // Had to change the way the table is constructed due to the issue outlined here: http://stackoverflow.com/questions/8084687/jquery-appended-table-adds-closing-tag-at-the-end-of-the-text-automatically-why
        var table = "<table class=\"table table-hover\">";

        //step through each "result" element
        $(xml).find("result").each(function() {

            tableRow="<tr><td class=\"text-center\">";

            // pull the "binding" element that has the name attribute of "image"
            $(this).find("binding[name='image']").each(function() {
                tableRow=tableRow+"<a href='"+$(this).find("uri").text() + "'>";
            });

            // pull the "binding" element that has the name attribute of "uri"
            $(this).find("binding[name='uri']").each(function() {
               tableRow=tableRow+"<img src='"+$(this).find("uri").text() + "'></a></td><td>";
            });

            // pull the "binding" element that has the name attribute of "title"
            $(this).find("binding[name='title']").each(function() {
                tableRow=tableRow+$(this).find("literal").text() + "</td></tr>";
            });

            table += tableRow;
        });

        $("#div1").append(table);
    }
}
