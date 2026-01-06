<script setup>
    import { useAuthStore } from '@/stores/authStore';
    import { useRouter } from 'vue-router'
    import { reactive } from 'vue';
    
    const auth = useAuthStore()
    const router = useRouter()

    const loginData = reactive({
        email: '',
        password: ''
    })

    const fieldErrors = reactive({
        email: '',
        password: ''
    })

    async function handleLogin(){
        // Reset errors
        Object.keys(fieldErrors).forEach(key => fieldErrors[key] = '')

        // Client-side validation
        if (!loginData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
            fieldErrors.email = 'Valid email is required'
        }
        if (!loginData.password || loginData.password.length < 1) {
            fieldErrors.password = 'Password is required'
        }
        if (Object.values(fieldErrors).some(err => err)) return

        // Call store action which now returns a normalized result
        const res = await auth.login({ email: loginData.email, password: loginData.password })

        if (res?.success) {
            router.push({ name: 'dashboard' })
            return
        }

        // Map validation errors returned from the store/service to fields
        const errors = res?.errors || auth.errors || {}
        Object.keys(errors).forEach(key => {
            if (fieldErrors[key] !== undefined) {
                fieldErrors[key] = Array.isArray(errors[key]) ? errors[key][0] : errors[key]
            }
        })
    }

</script>
<template>

    <div class="p-10 flex justify-center ">

        <form method="dialog" @submit.prevent="handleLogin" class="bg-white rounded-lg max-w-md w-full p-8 shadow-xl">

        <p class="text-red-500 text-lg mb-4">{{ auth.errors.general}}</p>

        <h2 class="text-2xl font-bold text-green-700 mb-6 text-center">Login</h2>

        <!-- Email -->
        <label class="block mb-4">
            <span class="text-gray-700 font-medium">Email</span>
            <input 
            type="email" 
            v-model="loginData.email"
            class="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
            placeholder="Enter your email"
            />
            <p class="text-red-500 text-sm mt-1">{{ fieldErrors.email }}</p>
        </label>

        <!-- Password -->
        <label class="block mb-6">
            <span class="text-gray-700 font-medium">Password</span>
            <input 
            type="password" 
            v-model="loginData.password"
            class="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
            placeholder="Enter your password"
            />
            <p class="text-red-500 text-sm mt-1">{{ fieldErrors.password }}</p>
        </label>

        <button 
            type="submit" 
            :disabled="auth.loading"
            class="w-full px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
            {{ auth.loading ? 'Logging in...' : 'Login' }}
        </button>
 
        </form>
    </div>

</template>