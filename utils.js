// const dns = require('dns')
const os = require('os')

const getIpAddress = () => {
  const networkInterfaces = os.networkInterfaces();
  console.log(networkInterfaces)
  let ipAddress = ''

  const platform = os.platform
  console.log(`OS Platform = ${platform}`)

  if (platform == 'linux') {
    networkInterfaces.eth0.forEach((item) => {
      if (item.family === 'IPv4') {
        ipAddress = item.address
      }
    })
  } else if (platform == 'win32') {
    networkInterfaces.Ethernet.forEach((item) => {
      if (item.family === 'IPv4') {
        ipAddress = item.address
      }
    })
  } else if (platform == 'darwin') {
    console.log(`getIpAddress for ${platform} not implemented yet!!!`)
  }

  console.log(`IP address = ${ipAddress}`)
  return ipAddress
}

module.exports = { getIpAddress }


