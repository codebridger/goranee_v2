<script setup lang="ts">
const theme = {
	primaryGradient: 'bg-grad-primary',
};
</script>

<template>
	<footer class="bg-[#2A1B28] text-white pt-16 pb-8 px-6 mt-10 rounded-t-[3rem]">
		<div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
			<div>
				<div class="flex items-center gap-2 mb-4">
					<div
						class="w-6 h-6 rounded-full bg-grad-primary flex items-center justify-center text-white text-xs font-bold">
						G</div>
					<h4 class="font-black text-2xl tracking-tighter">Goranee</h4>
				</div>
				<p class="text-gray-400 text-sm leading-relaxed">
					The ultimate platform for Kurdish music chords, lyrics, and community connections.
				</p>
			</div>
			<div>
				<h5 class="font-bold mb-4 text-pink-400 uppercase text-xs tracking-wider">Discover</h5>
				<ul class="space-y-2 text-sm text-gray-300">
					<li class="hover:text-white cursor-pointer transition">New Arrivals</li>
					<li class="hover:text-white cursor-pointer transition">Trending Charts</li>
					<li class="hover:text-white cursor-pointer transition">Featured Artists</li>
					<li class="hover:text-white cursor-pointer transition">Song Requests</li>
				</ul>
			</div>
			<div>
				<h5 class="font-bold mb-4 text-pink-400 uppercase text-xs tracking-wider">Community</h5>
				<ul class="space-y-2 text-sm text-gray-300">
					<li class="hover:text-white cursor-pointer transition">Sign Up / Login</li>
					<li class="hover:text-white cursor-pointer transition">Submit a Chord</li>
					<li class="hover:text-white cursor-pointer transition">Top Contributors</li>
					<li class="hover:text-white cursor-pointer transition">Discord Server</li>
				</ul>
			</div>
			<div>
				<h5 class="font-bold mb-4 text-pink-400 uppercase text-xs tracking-wider">Legal</h5>
				<ul class="space-y-2 text-sm text-gray-300">
					<li class="hover:text-white cursor-pointer transition">Privacy Policy</li>
					<li class="hover:text-white cursor-pointer transition">Terms of Service</li>
					<li class="hover:text-white cursor-pointer transition">DMCA Guidelines</li>
				</ul>
			</div>
		</div>
		<div
			class="text-center text-gray-600 text-xs border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
			<span>© 2025 Goranee.ir. All rights reserved.</span>
			<span class="mt-2 md:mt-0">Design System: <span class="text-gray-500">NeoBeat v1.1</span></span>
		</div>
	</footer>
</template>
