"""Tiny non-art GLB fixtures: untextured boxes with off-origin pivots."""
import json, struct, zlib
from pathlib import Path
out=Path('public/fixtures');out.mkdir(exist_ok=True)
def box(name,w,h,d,color):
    pts=[(x*w/2+2,y*h/2+1.5,z*d/2-3) for x,y,z in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
    faces=[(0,2,1),(0,3,2),(4,5,6),(4,6,7),(0,1,5),(0,5,4),(3,7,6),(3,6,2),(1,2,6),(1,6,5),(0,4,7),(0,7,3)]
    flat=[v for tri in faces for i in tri for v in pts[i]];binary=struct.pack('<'+'f'*len(flat),*flat)
    doc={'asset':{'version':'2.0','generator':'Habitat test fixture'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0}],'meshes':[{'primitives':[{'attributes':{'POSITION':0},'material':0}]}],'materials':[{'pbrMetallicRoughness':{'baseColorFactor':[*color,1],'metallicFactor':0,'roughnessFactor':.8}}],'buffers':[{'byteLength':len(binary)}],'bufferViews':[{'buffer':0,'byteOffset':0,'byteLength':len(binary)}],'accessors':[{'bufferView':0,'componentType':5126,'count':36,'type':'VEC3','min':[min(p[i] for p in pts) for i in range(3)],'max':[max(p[i] for p in pts) for i in range(3)]}]}
    if name=='projection':
        uv=struct.pack('<'+'f'*72,*([0.,0.,1.,0.,1.,1.]*12))
        def chunk(kind,data):return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data)&0xffffffff)
        png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',2,2,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(b'\x00\x20\x60\xb0\xee\xdd\x99\x00\xee\xdd\x99\x20\x60\xb0'))+chunk(b'IEND',b'')
        doc['bufferViews'] += [{'buffer':0,'byteOffset':len(binary),'byteLength':len(uv)},{'buffer':0,'byteOffset':len(binary)+len(uv),'byteLength':len(png)}]
        doc['accessors'].append({'bufferView':1,'componentType':5126,'count':36,'type':'VEC2'})
        doc['meshes'][0]['primitives'][0]['attributes']['TEXCOORD_0']=1
        doc['images']=[{'bufferView':2,'mimeType':'image/png'}];doc['textures']=[{'source':0,'sampler':0}];doc['samplers']=[{'magFilter':9728,'minFilter':9728}]
        doc['materials'][0]['pbrMetallicRoughness']['baseColorFactor']=[1,1,1,1]
        doc['materials'][0]['pbrMetallicRoughness']['baseColorTexture']={'index':0}
        binary+=uv+png;doc['buffers'][0]['byteLength']=len(binary)
    write(name,doc,binary)
def write(name,doc,binary=b''):
    j=json.dumps(doc,separators=(',',':')).encode();j+=b' '*((-len(j))%4);b=binary+b'\0'*((-len(binary))%4)
    chunks=struct.pack('<II',len(j),0x4e4f534a)+j
    if b:chunks+=struct.pack('<II',len(b),0x004e4942)+b
    (out/(name+'.glb')).write_bytes(struct.pack('<III',0x46546c67,2,12+len(chunks))+chunks)
box('crate',.5,.6,.4,[.65,.32,.15]);box('wardrobe',.6,1.5,.45,[.35,.45,.3]);box('projection',.4,.8,.4,[.23,.4,.6])
write('empty',{'asset':{'version':'2.0'},'scenes':[{'nodes':[]}],'scene':0})
