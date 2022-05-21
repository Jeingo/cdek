const url = "http://localhost"
    function sendJSON() {
        let data = JSON.stringify({"name": nameOrder.value, "trek": trek.value})
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: data
        })
        window.location.reload()
    }
        function sendJSONdel() {
        let data = JSON.stringify({"name": nameOrderDelete.value})
        fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: data
        })
        window.location.reload()
    }