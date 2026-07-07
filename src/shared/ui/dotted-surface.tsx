'use client';

import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode;
};

export function DottedSurface({ className, children, ...props }: DottedSurfaceProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer>(null);
    const requestRef = useRef<number>(0);

    useEffect(() => {
        if (!containerRef.current) return;

        const currentContainer = containerRef.current;
        const SEPARATION = 150;
        const AMOUNTX = 50;
        const AMOUNTY = 50;

        const scene = new THREE.Scene();

        // Fog diset hitam agar titik di kejauhan menghilang ke dalam gelap
        scene.fog = new THREE.Fog(0x000000, 2000, 10000);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.z = 1000;
        camera.position.y = 500;
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        const renderer = new THREE.WebGLRenderer({
            alpha: false, // Set false agar background benar-benar solid
            antialias: true
        });

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Background hitam pekat sesuai Batman Theme kamu
        renderer.setClearColor(0x000000, 1);
        currentContainer.appendChild(renderer.domElement);

        (rendererRef as any).current = renderer;

        const numParticles = AMOUNTX * AMOUNTY;
        const positions = new Float32Array(numParticles * 3);

        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                positions[i] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
                positions[i + 1] = 0;
                positions[i + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
                i += 3;
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Warna putih pekat (0xffffff) dan opacity ditingkatkan agar jelas
        const material = new THREE.PointsMaterial({
            size: 3.5,
            color: 0xffffff,
            transparent: true,
            opacity: 0.9, // Ditingkatkan agar sangat terlihat jelas
            sizeAttenuation: true
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        let count = 0;
        const animate = () => {
            requestRef.current = requestAnimationFrame(animate);

            const positions = geometry.attributes.position.array as Float32Array;
            let i = 0;
            for (let ix = 0; ix < AMOUNTX; ix++) {
                for (let iy = 0; iy < AMOUNTY; iy++) {
                    positions[i + 1] = (Math.sin((ix + count) * 0.3) * 50) +
                        (Math.sin((iy + count) * 0.5) * 50);
                    i += 3;
                }
            }
            geometry.attributes.position.needsUpdate = true;
            renderer.render(scene, camera);
            count += 0.1;
        };

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            renderer.dispose();
            if (currentContainer.contains(renderer.domElement)) {
                currentContainer.removeChild(renderer.domElement);
            }
        };
    }, []); // Dependency kosong karena kita ingin fix ke hitam & putih pekat

    return (
        <div className={cn('relative min-h-screen w-full bg-[#000000] overflow-hidden', className)} {...props}>
            <div
                ref={containerRef}
                className="pointer-events-none absolute inset-0 z-0 bg-[#000000]"
            />
            <div className="relative z-10 size-full">
                {children}
            </div>
        </div>
    );
}