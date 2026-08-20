"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const youtube_1 = require("../../src/utils/youtube");
describe('videoIdFromYouTubeUrl', () => {
    it('Returns video id for video with playlist id', () => {
        const result = (0, youtube_1.videoIdFromYouTubeUrl)('https://www.youtube.com/watch?v=kfchvCyHmsc&list=PLDyKn8uKYtRalFdBWtv_EjDtUo2UEbu-a');
        (0, chai_1.expect)(result).to.eq('kfchvCyHmsc');
    });
    it('Returns video id for direct url', () => {
        const result = (0, youtube_1.videoIdFromYouTubeUrl)('https://www.youtube.com/v/vLfAtCbE_Jc');
        (0, chai_1.expect)(result).to.eq('vLfAtCbE_Jc');
    });
    it('Returns video id for standard url', () => {
        const result = (0, youtube_1.videoIdFromYouTubeUrl)('https://www.youtube.com/watch?v=vLfAtCbE_Jc');
        (0, chai_1.expect)(result).to.eq('vLfAtCbE_Jc');
    });
    it('Returns video id for short url', () => {
        const result = (0, youtube_1.videoIdFromYouTubeUrl)('https://youtu.be/vLfAtCbE_Jc');
        (0, chai_1.expect)(result).to.eq('vLfAtCbE_Jc');
    });
    it('Returns video id for short url with share id', () => {
        const result = (0, youtube_1.videoIdFromYouTubeUrl)('https://youtu.be/iZxR7rPdvuQ?si=ad73DTmmXL_lbn31');
        (0, chai_1.expect)(result).to.eq('iZxR7rPdvuQ');
    });
    it('Returns video id for embed url', () => {
        const result = (0, youtube_1.videoIdFromYouTubeUrl)('https://www.youtube.com/embed/vLfAtCbE_Jc');
        (0, chai_1.expect)(result).to.eq('vLfAtCbE_Jc');
    });
    it('Returns undefined for non-youtube url', () => {
        const result = (0, youtube_1.videoIdFromYouTubeUrl)('https://omnivore.work/iZxR7rPdvuQ?si=ad73DTmmXL_lbn31');
        (0, chai_1.expect)(result).to.eq(undefined);
    });
    it('Returns undefined for non-youtube short url', () => {
        const result = (0, youtube_1.videoIdFromYouTubeUrl)('https://omnivore.work/?v=iZxR7rPdvuQ');
        (0, chai_1.expect)(result).to.eq(undefined);
    });
    it('Returns video id when port is added', () => {
        const result = (0, youtube_1.videoIdFromYouTubeUrl)('https://www.youtube.com:443/watch?v=kfchvCyHmsc');
        (0, chai_1.expect)(result).to.eq('kfchvCyHmsc');
    });
});
describe('isYouTubeVideoURL', () => {
    it('Returns false for a shorts URL', () => {
        const result = (0, youtube_1.isYouTubeVideoURL)('https://www.youtube.com/shorts/ZsQKYwXbo4s');
        (0, chai_1.expect)(result).to.eq(false);
    });
    it('Returns false for a non-youtube URL', () => {
        const result = (0, youtube_1.isYouTubeVideoURL)('https://omnivore.work/about');
        (0, chai_1.expect)(result).to.eq(false);
    });
    it('Returns true for a video URL', () => {
        const result = (0, youtube_1.isYouTubeVideoURL)('https://www.youtube.com/watch?v=p4YOXmm839c');
        (0, chai_1.expect)(result).to.eq(true);
    });
});
