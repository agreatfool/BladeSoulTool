"use strict";

var path = require('path');

var BstConst = function() {};

//------------------------------------------------------------------------
//- GLOBAL
//------------------------------------------------------------------------
BstConst.PART_BODY = 'body';
BstConst.PART_FACE = 'face';
BstConst.PART_HAIR = 'hair';

BstConst.BACKUP_TAIL = '.bst_bak';

BstConst.PATH_DATABASE = path.join(process.cwd(), 'database');

BstConst.PART_TYPES = ['costume', 'attach', 'weapon'];
BstConst.PART_TYPE_COSTUME = 'costume';
BstConst.PART_TYPE_ATTACH  = 'attach';
BstConst.PART_TYPE_WEAPON  = 'weapon';
BstConst.PART_TYPE_UNRECOGNIZED = 'unrecognized';

BstConst.PATH_PNG_CPS_FAILURE = path.join(process.cwd(), 'database', 'png_cps_failure.json');

//------------------------------------------------------------------------
//- MESH XML
//------------------------------------------------------------------------
BstConst.PATH_MESH_XML = path.join(process.cwd(), 'resources/dedat/output/engine/charactertoolappearance_mesh.xml');
BstConst.RACE_VALID = ['곤', '건', '진', '린'];

//------------------------------------------------------------------------
//- UPK
//------------------------------------------------------------------------
BstConst.UPK_NO_OBJ_ERROR = 'Specified package(s) has no supported objects';
BstConst.UPK_UNKNOWN_MEMBER_ERROR = '*** unknown member';

BstConst.UPK_ENTRANCE_LINE_NO = 2; // 一般来说，log的第三行里的内容是关键信息
BstConst.UPK_TYPE_SKELETON = 'SkeletalMesh3';
BstConst.UPK_TYPE_TEXTURE  = 'Texture2D';
BstConst.UPK_TYPE_MATERIAL = 'MaterialInstanceConstant';

BstConst.PATH_UPK_BASE = 'database/upk';
BstConst.PATH_UPK_LOG = path.join(process.cwd(), BstConst.PATH_UPK_BASE, 'log');
BstConst.PATH_UPK_DATA_LIST = path.join(process.cwd(), BstConst.PATH_UPK_BASE, 'data/list');
BstConst.PATH_UPK_DATA_RAW = path.join(process.cwd(), BstConst.PATH_UPK_BASE, 'data/raw');

BstConst.LIST_FILE_SKELETON_COSTUME = 'list_skeleton_costume.json';
BstConst.LIST_FILE_SKELETON_ATTACH = 'list_skeleton_attach.json';
BstConst.LIST_FILE_SKELETON_WEAPON = 'list_skeleton_weapon.json';
BstConst.LIST_FILE_SKELETON_HAIR = 'list_skeleton_hair.json';
BstConst.LIST_FILE_SKELETON_UNRECOGNIZED = 'list_skeleton_unrecognized.json';
BstConst.LIST_FILE_TEXTURE = 'list_texture.json';
BstConst.LIST_FILE_MATERIAL = 'list_material.json';
BstConst.LIST_FILE_UNRECOGNIZED = 'list_unrecognized.json';

BstConst.RAW_FILE_ICON = 'raw_icon.json';
BstConst.RAW_FILE_ICON_INVALID = 'raw_icon_invalid.json';
BstConst.RAW_FILE_SKELETON = 'raw_skeleton.json';
BstConst.RAW_FILE_SKELETON_INVALID = 'raw_skeleton_invalid.json';
BstConst.RAW_FILE_TEXTURE = 'raw_texture.json';
BstConst.RAW_FILE_MATERIAL = 'raw_material.json';
BstConst.RAW_FILE_MATERIAL_INVALID = 'raw_material_invalid.json';

BstConst.HAIR_UPK_CORE_PREFIX = 'Hair_';
BstConst.UPK_REPLACE_SHORT_TO_LONG_LIMIT = 8; // upk内容短改长的极限长度，因为是使用当前upk文件名进行短改长的补足，所以最多就8位长度

BstConst.UPK_INVALID_TEXTURE_UPK_IDS = [
    '00002620', // Material3：常见于costume类型数据中：core：Material3 Basic
    '00002640', // Texture2D：大量材质相关obj
    '00002665', // MaterialInstanceConstant：材质upk
    '00002700', // MaterialInstanceConstant：材质upk
    '00005708', // Texture2D：常见于attach类型数据中特别是眼镜上的glasses obj：obj：D, S, glasses3_m
    '00007428', // MaterialInstanceConstant：材质upk
    '00008124', // MaterialInstanceConstant：材质upk
    '00008613', // MaterialInstanceConstant：常见于attach, weapon类型数据中：core：NothingMAT
    '00009220', // MaterialInstanceConstant：材质upk
    '00012963', // Texture2D：大量无用obj
    '00016228', // MaterialInstanceConstant：材质upk
    '00016234', // MaterialInstanceConstant：材质upk
    '00016237', // MaterialInstanceConstant：材质upk
    '00016885', // MaterialInstanceConstant：材质upk
    '00017459', // MaterialInstanceConstant：材质upk
    '00018859', // MaterialInstanceConstant：材质upk
    '00021199', // MaterialInstanceConstant：材质upk
    '00021666', // MaterialInstanceConstant：材质upk
    '00021668', // MaterialInstanceConstant：材质upk
    '00021674'  // MaterialInstanceConstant：材质upk
];

/**
 * 某些特殊的材质upk文件，里面引用了多个贴图upk文件，
 * 且，最主要的贴图upk文件可能还放在某些不是很重要的贴图upk文件的下面，
 * 解析的时候是取第一个出现的贴图upk文件，所以就会出现某些材质upk和贴图upk文件关联错误的情况，
 * 在raw_texture.json里的部分贴图可能多出一些材质，而部分贴图可能完全没有材质，
 * 这个配置就是进行特例描述，将部分特例进行预配置
 * 具体例子参考：骨骼：00022166，贴图：00022167，材质：00022168
 * 该配置的结构基本上和 raw_material.json 里相同：
 * {
 *     "00022168": {
 *         "col": "col1",
 *         "texture": "00022167",
 *         "objs": [
 *             "060012_JinF_col1_D",
 *             "060012_JinF_col1_E",
 *             "060012_JinF_col1_M",
 *             "060012_JinF_col1_N",
 *             "060012_JinF_col1_S"
 *         ]
 *     }
 * }
 */
BstConst.UPK_PRE_DEFINED_MATERIAL_INFO = {
    "00022168": {
        "col": "col1",
        "texture": "00022167",
        "objs": [
            "060012_JinF_col1_D",
            "060012_JinF_col1_E",
            "060012_JinF_col1_M",
            "060012_JinF_col1_N",
            "060012_JinF_col1_S"
        ]
    },
    "00022176": {
        "col": "col1",
        "texture": "00022174",
        "objs": [
            "060011_JinF_col1_D",
            "060011_JinF_col1_E",
            "060011_JinF_col1_M",
            "060011_JinF_col1_N",
            "060011_JinF_col1_S"
        ]
    },
    "00022181": {
        "col": "col1",
        "texture": "00022179",
        "objs": [
            "060008_JinF_col1_D",
            "060008_JinF_col1_M",
            "060008_JinF_col1_N",
            "060008_JinF_col1_S"
        ]
    }
};

/**
 * 某些特殊的贴图upk文件，其文件描述可能是贴图（MaterialInstanceConstant），
 * 但其实其职责是贴图，遇到这样的情况，在一开始骨骼分类的时候这个upk文件就已经被分到材质部分去了，
 * 于是模型解析的时候就会找不到贴图，这个配置就是进行特例描述，将部分特例进行预配置
 * 具体例子参考：骨骼：00013151，贴图：00013149，材质：00013150
 * 该配置的结构基本上和 raw_texture.json 里相同：
 * {
 *     "00013149": {
 *         "objs": [
 *             "00001_KunN_d",
 *             "00001_KunN_m",
 *             "00001_KunN_n",
 *             "00001_KunN_s"
 *         ],
 *         "materials": {}
 *     }
 * }
 */
BstConst.UPK_PRE_DEFINED_TEXTURE_INFO = {
    "00013149": {
        "objs": [
            "00001_KunN_d",
            "00001_KunN_m",
            "00001_KunN_n",
            "00001_KunN_s"
        ],
        "materials": {}
    }
};

//------------------------------------------------------------------------
//- ICON
//------------------------------------------------------------------------
BstConst.ICON_UPK_ID = '00008758';
BstConst.PATH_ICON_BASE = 'database/icon';
BstConst.PATH_ICON_TGA = path.join(process.cwd(), BstConst.PATH_ICON_BASE, 'tga');
BstConst.PATH_ICON_PNG = path.join(process.cwd(), BstConst.PATH_ICON_BASE, 'png');
BstConst.PATH_ICON_PNG_CPS = path.join(process.cwd(), BstConst.PATH_ICON_BASE, 'png-cps');
BstConst.PATH_ICON_CONVERSION_FAILURE = path.join(process.cwd(), BstConst.PATH_ICON_BASE, 'conversion_failure.json');

module.exports = BstConst;