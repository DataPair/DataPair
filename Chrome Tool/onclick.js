(function () {

  let PAGE_LOAD_KEY = "totalNetworkServerTime";
  let precedingTime = pageLoadTotalTime = counter = 0;

  let orderOfEvents = [
    {
      'key': 'navigation',
      'label': 'Navigation Starts',
      'calculation': 'Navigation Starts + Redirects + Unload/Refreshes'
    },

    {
      'key': 'appCache',
      'label': 'Browser Cache',
      'calculation': 'Resource Loaded From Browser Cache'
    },

    {
      'key': 'dnsLookup',
      'label': 'DNS Lookup',
      'calculation': 'DNS lookup time'
    },

    {
      'key': 'tcpHandshake',
      'label': 'Connection Time',
      'calculation': 'TCP connection + SSL negotiation duration'
    },

    {
      'key': 'requestTime',
      'label': 'Time to First Byte',
      'calculation': 'Request to First Response'
    },

    {
      'key': 'responseTime',
      'label': 'Server Latency',
      'calculation': 'Server Time For Content Downloads'
    }
  ];

  chromeExtension = {
    generate: () => {

      chrome.tabs.executeScript(
        {
          file: 'background.js'
        },
        function (result) {

          pageLoadTotalTime = result[0][PAGE_LOAD_KEY];
          let dataParent = document.getElementsByClassName('data')[0];

          let node = chromeExtension.createRow("Total Server Time", pageLoadTotalTime, 0, pageLoadTotalTime);
          dataParent.appendChild(node);

          chromeExtension.incrementCounter();

          for (let i in orderOfEvents) {
            let key = orderOfEvents[i].key;
            let time = result[0][key];
            let displayName = orderOfEvents[i].label;
            let dataRow = chromeExtension.createRow(displayName, time);

            dataParent.appendChild(dataRow);

            precedingTime = precedingTime + time;
            chromeExtension.incrementCounter();
          }

          chromeExtension.createRowMouseOverEvent();
        }
      );
    },

    incrementCounter: () => {
      counter = counter + 1;
    },

    createRow: function (key, value) {
      let bar;
      let clearfix;
      let barCopy;

      let doc = document.createElement('div');
      doc.className = 'performance-row performance-row-' + counter + ' key-' + counter;

      let label = document.createElement('span');
      label.className = 'performance-label';
      label.textContent = key;

      let time = document.createElement('span');
      time.className = 'performance-time';
      time.textContent = value + " ms";

      bar = (key === PAGE_LOAD_KEY) ? this.createGraphTotal() : this.createGraph(key, value, counter);
      if (document.getElementsByClassName('performance-graph-total')[0]) {
        barCopy = this.createChartData(value, counter);
        document.getElementsByClassName('performance-graph-total')[0].appendChild(barCopy);
      }

      doc.appendChild(label);
      doc.appendChild(bar);
      doc.appendChild(time);

      clearfix = this.createClearfixDOMElement();
      doc.appendChild(clearfix);
      return doc;
    },


    createGraphTotal: function () {
      let group = document.createElement('div');
      group.className = 'performance-graph-total';
      return group;
    },

    createGraph: function (key, value) {
      let group = document.createElement('span');
      group.className = 'performance-graph ' + key;
      let preTime = this.createPreChartSpacing(counter);
      let thisKeyTime = this.createChartData(value, counter);
      let clearfix = this.createClearfixDOMElement();

      group.appendChild(preTime);
      group.appendChild(thisKeyTime);
      group.appendChild(clearfix);

      return group;
    },

    createChartData: (value) => {
      let doc = document.createElement('span');
      doc.className = 'performance-graph-key key-' + counter;
      doc.style.width = (value / pageLoadTotalTime * 100) + '%';
      return doc;
    },

    createPreChartSpacing: () => {
      let doc = document.createElement('span');
      doc.className = 'performance-graph-pre key-' + counter;
      doc.style.width = (precedingTime / pageLoadTotalTime * 100) + '%';
      return doc;
    },

    createClearfixDOMElement: () => {
      let clear = document.createElement('span');
      clear.className = 'clearfix';
      return clear;
    },

    createRowMouseOverEvent: () => {
      let explanation = document.getElementsByClassName('explanation')[0];
      let preText = "Calc: ";
      for (let i = 1; i < (orderOfEvents.length + 1); i++) {
        document.getElementsByClassName('performance-row-' + i)[0].onmouseout = () => {
          explanation.innerHTML = ' ';
        };
      }
      document.getElementsByClassName('performance-row-1')[0].onmouseover = () => {
        explanation.innerHTML = preText + orderOfEvents[0].calculation;
      };
      document.getElementsByClassName('performance-row-2')[0].onmouseover = () => {
        explanation.innerHTML = preText + orderOfEvents[1].calculation;
      };
      document.getElementsByClassName('performance-row-3')[0].onmouseover = () => {
        explanation.innerHTML = preText + orderOfEvents[2].calculation;
      };
      document.getElementsByClassName('performance-row-4')[0].onmouseover = () => {
        explanation.innerHTML = preText + orderOfEvents[3].calculation;
      };
      document.getElementsByClassName('performance-row-5')[0].onmouseover = () => {
        explanation.innerHTML = preText + orderOfEvents[4].calculation;
      };
      document.getElementsByClassName('performance-row-6')[0].onmouseover = () => {
        explanation.innerHTML = preText + orderOfEvents[5].calculation;
      };
    },

    init: () => {
      chrome.tabs.executeScript({ file: 'onclick.js' }, (result) => chromeExtension.generate());
    }
  }

  window.addEventListener("load", load = () => {
    window.removeEventListener("load", load, false);
    chromeExtension.init();
  }, false);

})();