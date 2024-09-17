import { Client } from "ssh2";
const conn = new Client();

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
					if (buffer.search("(HOME-4250-01)#" != -1)) {

						let lines = buffer.split('\n');
						lines.forEach((line) => {
							// console.log(line);
							switch(line) {
								case "--More-- or (q)uit":
									stream.write(' \n');
									break;
								case "(HOME-4250-01)#":
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
			host: 'HOME-4250-01.local',
			port: 22,
			username: 'admin',
			password: '@V0IP!@V0IP!' // Make sure to replace 'password' with the actual password
		});
	})

	
}

console.log(await getConfig());