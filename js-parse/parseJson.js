let rawData = false;
fetch('/result.json')
  .then(response => response.json())
  .then(data => {
    window.scenes = processScenes(data);
  })
  .catch(error => {
    console.error(error);
  });

function processScenes(data) {
    let scenes = prepareScenes(data);
    scenes = stitchScenes(scenes);
    scenes.forEach(scene => {
        scene['raw'] = writeScene(scene, 'raw');
        scene['fountain'] = writeScene(scene, 'fountain');
    })
    return scenes;
}
function writeScene(scene, format) {
        let script = processHeader(scene);
        script += scene.scene ? scene.scene.forEach(part => processPart(part, format)) : 'nothing is real';
        return script;
    }



  //Go through Data. Keep track of the index as pageNum. Each page has a content array with an array of scenes. Some scenes span multiple pages. Extract all the scenes. And include the indexes of pages they appear on as a 'pages' array
    //Path: js-parse/parseJson.js
    function prepareScenes(data) {
        let pageNum = 0;
        let scenes = [];
        data.forEach(scene => {
                if(scene.scene_number) {
                    scene.pages = [];
                    scene.pages.push(pageNum);
                    scenes.push(scene);
                }
            pageNum++;
        });
        scenes = stitchScenes(scenes);
        window.scenes = scenes;
        return scenes; 
    }

    function stitchScenes(scenes) {
        //combine all scenes with same scene_number
        let uniqueScenes = [];
        scenes.forEach(scene => {
            if(scene.scene_number) {
                let found = false;
                uniqueScenes.forEach(currentScene => {
                    if(currentScene.scene_number === scene.scene_number && currentScene.parts) {
                        found = true;
                        currentScene.pages = [...currentScene.pages, ...scene.pages];
                        currentScene.scene = [...currentScene.scene, ...scene.scene];
                    }
                });
                if(!found) {
                    uniqueScenes = [...uniqueScenes, scene];
                }
            }
        }
        );
        return uniqueScenes;
    }

    function processHeader(scene) {
        let processed = scene.scene_info && `${scene.scene_info.region} ${scene.scene_info.location}`;
        if(scene.scene_info.time) scene.scene_info.time.forEach(time => processed += ` - ${time}`);
        return processed;
    }
    function processAction(lines, format) {
        let processed = '';
        if(format === 'fountain') {
            lines.forEach(line => processed += `${line.text}`);
        } else if(format === 'raw') {
            lines.forEach(line => processed += `${line.text}`);
        }
        return processed;
    }

    function processDialogue(content, format) {
        const character = content.character + (content.modifier && ` (${content.modifier})`);
        const dialogue = content.dialogue;
        let processed = '';
        if(format === 'fountain') {
            processed += `${character}
            `;
            dialogue.forEach(line => {
                processed += `\n${line}`;
            });
        }  else if(format === 'raw') {
            processed += `${character.character}${character.modifier && ` (${character.modifier})`}: ${dialogue.join(' ')}`;
        }   
        return processed;
    }
    function processPart(part, format) {
        let processed = '';
        if(part.type === 'ACTION') processed = processAction(part.content, format);
        else if(part.type === 'CHARACTER') processed = processDialogue(part.content, format);
        return processed;
    }


