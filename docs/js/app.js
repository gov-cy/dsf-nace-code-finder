/**
 * On window load
 */
$(window).on('load', function () {

    //disable cache on ajax
    $.ajaxSetup({ cache: false });

    //get data from json
    $.getJSON("data/nace_rev2.json", function (data) {

        //filter for four digit codes only 
        if ("geolocation" in navigator) {
            
        }
        var filteredData = data.filter(filterFourDigit);

        //the mustache template
        var mustacheTemplate = "{{#.}}<tr><th>{{Code}}</th><td><b>Ελληνικά: </b>{{Description_el}} <br><b>English: </b>{{Description_en}}</td></tr>{{/.}}";
        //render using mustache
        var content = Mustache.render(mustacheTemplate, filteredData);

        //render on page
        $("#NACEBody").html(content);

        //create datatable
        $('#NICETable').DataTable({
            responsive: true,
            fixedHeader: true,
            info: false,
            ordering: false,
            lengthChange: false,
            // paging: false,
            language: {
                "search": "Αναζήτηση / Search <br>",
                "zeroRecords": "Δεν βρέθηκαν αποτελέσματα / No matching records found",
            },
            "pageLength": 10
        });
    });

});

/**
 * A function that returns true if the `item.Code` is a four digit number
 * 
 * @param {*} item the object to check for filtering 
 * @returns boolean
 */
function filterFourDigit(item) {
    if (item.Code < 100000) {
      return true;
    }
    return false;
  }