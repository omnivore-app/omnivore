"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai = __importStar(require("chai"));
const chai_1 = require("chai");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const fs_1 = __importDefault(require("fs"));
require("mocha");
const nock_1 = __importDefault(require("nock"));
const user_1 = require("../../src/services/user");
const parser_1 = require("../../src/utils/parser");
const db_1 = require("../db");
chai.use(chai_as_promised_1.default);
const load = (path) => {
    return fs_1.default.readFileSync(path, 'utf8');
};
describe('parseMetadata', () => {
    it('gets author, title, image, description', () => {
        const html = load('./test/utils/data/substack-post.html');
        const metadata = (0, parser_1.parsePageMetadata)(html);
        (0, chai_1.expect)(metadata?.author).to.deep.equal('Omnivore');
        (0, chai_1.expect)(metadata?.title).to.deep.equal('Code Block Syntax Highlighting');
        (0, chai_1.expect)(metadata?.previewImage).to.deep.equal('https://cdn.substack.com/image/fetch/w_1200,h_600,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F2ab1f7e8-2ca7-4011-8ccb-43d0b3bd244f_1490x2020.png');
        (0, chai_1.expect)(metadata?.description).to.deep.equal('Highlighted <code> in Omnivore');
    });
});
describe('parsePreparedContent', () => {
    it('gets published date when JSONLD fails to load', async () => {
        (0, nock_1.default)('https://stratechery.com:443', { encodedQueryParams: true })
            .get('/wp-json/oembed/1.0/embed')
            .query({ url: 'https%3A%2F%2Fstratechery.com%2F2016%2Fits-a-tesla%2F' })
            .reply(401);
        const html = load('./test/utils/data/stratechery-blog-post.html');
        const result = await (0, parser_1.parsePreparedContent)('https://blog.omnivore.work/', {
            document: html,
            pageInfo: {},
        });
        (0, chai_1.expect)(result.parsedContent?.publishedDate?.getTime()).to.equal(new Date('2016-04-05T15:27:51+00:00').getTime());
    });
    it('returns a highlight range if markers are found in the HTML', async () => {
        const html = `
      <html>
        <body>
          <div>
            <div id='article-container'>
              some prefix text
              <span data-omnivore-highlight-start="true"></span>This is some text within the highlight markers<span data-omnivore-highlight-end="true"></span>
              some suffix text
            </div>
          </div>
        </body>
      </html>
    `;
        const result = await (0, parser_1.parsePreparedContent)('https://blog.omnivore.work/', {
            document: html,
            pageInfo: {},
        });
        (0, chai_1.expect)(result.highlightData?.quote).to.eq('This is some text within the highlight markers');
    });
});
// describe('parsePreparedContent', () => {
//   nock('https://oembeddata').get('/').reply(200, {
//     version: '1.0',
//     provider_name: 'Hippocratic Adventures',
//     provider_url: 'https://www.hippocraticadventures.com',
//     title:
//       'The Ultimate Guide to Practicing Medicine in Singapore &#8211; Part 2',
//   })
//   it('gets metadata from external JSONLD if available', async () => {
//     const html = `<html>
//                     <head>
//                     <link rel="alternate" type="application/json+oembed" href="https://oembeddata">
//                     </link
//                     </head>
//                     <body>body</body>
//                     </html>`
//     const result = await parsePreparedContent('https://blog.omnivore.work/', {
//       document: html,
//       pageInfo: {},
//     })
//     expect(result.parsedContent?.title).to.equal(
//       'The Ultimate Guide to Practicing Medicine in Singapore – Part 2'
//     )
//   })
// })
describe('isProbablyArticle', () => {
    let user;
    before(async () => {
        user = await (0, db_1.createTestUser)('fakeUser');
    });
    after(async () => {
        await (0, user_1.deleteUser)(user.id);
    });
    it('returns true when email is signed up with us', async () => {
        const email = user.email;
        (0, chai_1.expect)(await (0, parser_1.isProbablyArticle)(email, 'test subject')).to.be.true;
    });
    it('returns true when subject has omnivore: prefix', async () => {
        const subject = 'omnivore: test subject';
        (0, chai_1.expect)(await (0, parser_1.isProbablyArticle)('test-email', subject)).to.be.true;
    });
});
describe('getTitleFromEmailSubject', () => {
    it('returns the title from the email subject', () => {
        const title = 'test subject';
        const subject = `omnivore: ${title}`;
        (0, chai_1.expect)((0, parser_1.getTitleFromEmailSubject)(subject)).to.eql(title);
    });
});
describe('parseEmailAddress', () => {
    it('returns the name and address when in name <address> format', () => {
        const name = 'test name';
        const address = 'tester@omnivore.work';
        const parsed = (0, parser_1.parseEmailAddress)(`${name} <${address}>`);
        (0, chai_1.expect)(parsed.name).to.eql(name);
        (0, chai_1.expect)(parsed.address).to.eql(address);
    });
    it('returns the address when in address format', () => {
        const address = 'tester@omnivore.work';
        const parsed = (0, parser_1.parseEmailAddress)(address);
        (0, chai_1.expect)(parsed.name).to.eql('');
        (0, chai_1.expect)(parsed.address).to.eql(address);
    });
});
