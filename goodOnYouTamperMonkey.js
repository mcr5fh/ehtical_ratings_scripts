// ==UserScript==
// @name         GoodOnYou Company Ratings
// @version      0.1
// @description  Get data about how ethical companies are by querying in the small form this script adds to your browser
// @author       me
// @match        https://www.amazon.com/*
// @grant        none
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==

const CSS_URLS = ["https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/components/form.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/components/container.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/components/grid.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/components/header.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/components/menu.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/components/table.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/components/button.min.css"
    ]

const POPUP_HTML = `

<div id="over_div"
    style="
    background-color:white;
    border-radius: 5px;
    border:20px;
    padding:20px;
    display: block;
    position: fixed;
    top: 10px;
    right: 10px;
    max-width: 35%;
    z-index: 500;
    "">
    <div id="main_container">
        <div id="company_info">
            <div class="ui small header">Search for company!</div>
        </div>
        <div id="tm" class="ui content">
            © 2020 Good On You
        </div>
        <form class="ui form" >
            <div class="field">
                <div class="ui fluid action input focus">
                    <input id="company_name" type="text" style="width: -webkit-fill-available;">
                </div>
                <button
                id="submit_button"
                type="submit"
                value="Search company"
                class="ui button">
                    Search company
                </button>
            </div>
        </form>
    </div>
    <button id="show_hide_button" class="ui primary right floated button">Show/Hide</button>
</div>

`;

// React esque
const comanyInfoHtml = (data) => {
    return `
<b> ${data.name} </b>
<br/>
Details: ${data.ethical_info1},
<table class="ui collapsing celled table">
    <thead>
        <tr>
            <th>Category</th>
            <th>Rating</th>
            <th>Verdict</th>
        </tr></thead>
        <tbody>
            <tr>
                <td>
                    Ethical
                </td>
                <td>
                    ${data.ethical_rating}
                </td>
                <td>
                    ${data.ethical_label}
                </td>
            </tr>
            <tr>
                <td>
                    Animal
                </td>
                <td>
                    ${data.animal_rating}
                </td>
                <td>
                    ${data.animal_label}
                </td>
            </tr>
            <tr>
                <td>
                    Environment
                </td>
                <td>
                    ${data.environment_rating}
                </td>
                <td>
                    ${data.environment_label}
                </td>
            </tr>
            <tr>
                <td>
                    Labour_rating:
                    <td>
                        ${data.labour_rating}
                    </td>
                    <td>
                        ${data.labour_label}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
    `
}


var lastSearch = "";

var isHidden = false;

function init() {
    console.log("Starting");
	$('body').prepend(POPUP_HTML)
    // $('body').append('<div id="comapnies">'+new Array(...KNOWN_COMPANIES).join('<br/>')+'</div>')
    $('body').append('<br/><pre id="found_text_2"></pre>')
	console.log("Appended");

	$('#submit_button').click(function(event) {
        event.preventDefault();

        brand = document.getElementById("company_name").value;
        console.log("Searching for : " + brand)
        searchBrand(brand)
	});

    $('#show_hide_button').click(function() {
        if (isHidden) {
            $("#main_container").css({'display':'block'});
        } else {
            $("#main_container").css({'display':'none'});
        }
        isHidden = !isHidden;
    });

    $('#company_name').keydown(function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            console.log(event);
            event.preventDefault();
            $('#submit_button').click()
        }
    });
};

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }

    return text;
}

async function getBrandDetails(brandName) {
    const response = await fetch("https://api.goycloud.com/functions/getBrandDetails-V2", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "text/plain",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site"
        },
        "referrer": "https://directory.goodonyou.eco/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "{\"id\":\"" + brandName + "\",\"_ApplicationId\":\"gcrp2V42PHW7S8ElL639\",\"_ClientVersion\":\"js2.1.0\",\"_InstallationId\":\"9d5df469-a63c-de6f-b3e9-4746de895026\"}",
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
    })
    return response.json();
}

function searchBrand(text) {
    console.log("Found Text: " + text)
    const wordList = text.split(" ");
    if (wordList.length < 4) {
        const comapanyName = wordList.join('-');
        if (comapanyName != lastSearch) {
            lastSearch = comapanyName;
            console.log("Looking up known company: " + comapanyName);
            getBrandDetails(comapanyName.toLowerCase())
                .then(data => {
                    console.log(data)
                    const dataToShow = getDataFromResponse(data)
                    document.getElementById("company_info").innerHTML = getDataFromResponse(data);
                    // document.getElementById("found_text_2").innerHTML = getDataFromResponse(data);
                })
        }
    }
}

function getDataFromResponse(data) {
    const dataRoot = data.result;
    console.log(dataRoot)
    return comanyInfoHtml(dataRoot)

}

function downloadCss() {
    CSS_URLS.forEach(css_url => {
        console.log("pulling :" + css_url)
        $.ajax({
            url: css_url,
            success: function(data) {
                $("<style></style>").appendTo("head").html(data);
            }
        })
    });
}

(function() {
    'use strict';

    downloadCss();

    $(document).ready(function() {
        init();
    });

})();