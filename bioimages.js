$(document).ready(function(){

    // creates a function that's executed when the button is clicked
    $("button").click(function(){

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
                    "LIMIT 10";

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


// function to turn XML object into a string
function getXmlString(xml) {
  if (window.ActiveXObject) { return xml.xml; }
  return new XMLSerializer().serializeToString(xml);
}

// converts nodes of an XML object to text. See http://tech.pro/tutorial/877/xml-parsing-with-jquery
// and http://stackoverflow.com/questions/4191386/jquery-how-to-find-an-element-based-on-a-data-attribute-value
function parseXml(xml) {

    $("#div1").html("").append("<table>");

    //step through each "result" element
    $(xml).find("result").each(function() {

        tableRow="<tr><td>";

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
            $("#div1").append(tableRow);
        });
    });

    $("#div1").append("</table>");
}
