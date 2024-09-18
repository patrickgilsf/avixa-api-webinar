/*
this did not make it into the tutorial. Its a script for SSHing into a netgear switch and pulling the config
you need two secrets in your .env file
- netgearHostname: the hostname of the switch, found on the command prompt
- netgearPassword: the password of your switch
- (if not using admin) netgearUsername: the username of the ssh login
*/

import { Client } from "ssh2";
const conn = new Client();

const switchHostname = process.env.netgearHostname;

if (!switchHostname) {
  console.log(`you need to add the switch's hostname as switchHostname to the .env file to make this work`);
  return;
} 

let getConfig = async () => {
	return new Promise((resolve, reject) => {
		conn.on('ready', async () => {
			const moreDataPrompt = "--More-- or (q)uit"
			conn.shell((err, stream) => {
				if (err) throw err;
		
				let buffer = '';
				
				stream.on('close', () => {
					console.log('Stream :: close');
					conn.end();
				}).on('data', (data) => {
					buffer += data.toString('utf8');
					let rtn = "";
          if (buffer.search(`(${netgearHostname})#` != -1)) {

						let lines = buffer.split('\n');
						lines.forEach((line) => {
							// console.log(line);
							switch(line) {
								case "--More-- or (q)uit":
									stream.write(' \n');
									break;
								case `(${netgearHostname})#`:
									resolve(rtn);
									break;
								default:
									rtn = `${rtn}${line}`
							}
							// // console.log(line.search("(HOME-4250-01)") != -1);
							// // console.log(`(HOME-4250-01)#` == "(HOME-4250-01)#");
							// if (line.search(/--More-- or \(q\)uit/) != -1) {
							// 	buffer = ""
							// 	stream.write(' \n');
							// } else if (line.search("(HOME-4250-01)#") != -1) {
							// 	// console.log('found')
							// 	// buffer = "";
							// 	// line = [];
							// 	// console.log(line);
							// 	resolve(lines);
							// }	else {
							// 	// console.log(line);
							// 	// resolve(lines);
							// }
							// // resolve(lines);
						});
					}
					
		

					// resolve(lines);
				});
		
				// Initial command to start the interaction
				stream.write('enable\n');
				stream.write("show igmpsnooping\n")
			
			});
		}).connect({
			host: `${process.env.netgearHostname}.local`, //or, the ip address of your switch
			port: 22,
			username: process.env.netgearUsername || 'admin',
			password: process.env.netgearPassword
		});
	})

	
}

export default getConfig;
