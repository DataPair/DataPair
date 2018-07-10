(function () {
  let p = {};

  //#1 - Navigation to Browser Cache - includes Unload/Redirects
  p.navigation = performance.timing.fetchStart - performance.timing.navigationStart;

  //#2 - App Cache - Browser Cache
  p.appCache = performance.timing.domainLookupStart - performance.timing.fetchStart;

  //#3 - DNS Time - Domain Lookup for IP
  p.dnsLookup = performance.timing.domainLookupEnd - performance.timing.domainLookupStart;

  //#4 - TCP Handshake: connectEnd - connectStart
  p.tcpHandshake = performance.timing.connectEnd - performance.timing.connectStart;
  // Negotiating SSL - Encrypting the Connection
  // p.sslDuration = performance.timing.connectEnd - performance.timing.secureConnectionStart;

  //#5 - Time to first byte (TTFB) (Request): responseStart - requestStart
  p.requestTime = performance.timing.responseStart - performance.timing.connectEnd;

  //#6 - Response Time To Requests - Server Latency
  p.responseTime = performance.timing.responseEnd - performance.timing.responseStart;

  p.totalNetworkTime = performance.timing.connectEnd - performance.timing.navigationStart;
  p.totalServerTime = performance.timing.responseEnd - performance.timing.connectEnd;
  // p.totalClientTime = performance.timing.loadEventEnd - performance.timing.responseEnd;

  p.totalNetworkServerTime = performance.timing.responseEnd - performance.timing.navigationStart;
  // p.totalNetworkServerTime = p.totalNetworkTime + p.totalServerTime;
  // p.totalTime = p.totalNetworkTime + p.totalServerTime + p.totalClientTime;

  return p;
})();