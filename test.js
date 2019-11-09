import test from 'ava';
import fawryNode from '.';

test('title', t => {
	t.throws(() => {
		fawryNode(123);
	}, {
		instanceOf: TypeError,
		message: 'Expected a string, got number'
	});

	t.is(fawryNode('unicorns'), 'unicorns & rainbows');
});
